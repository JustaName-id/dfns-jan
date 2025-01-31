'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { WebAuthnSigner } from "@dfns/sdk-browser"
import { FormEvent, useState } from "react"

export default function RegisterUser() {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(undefined)
    const [error, setError] = useState(undefined)

    const register = async (event: FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true)
            event.preventDefault()

            const formData = new FormData(event.currentTarget)

            const initRes = await fetch('/api/register/init', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username') as string,
                }),
            })
            const challenge = await initRes.json()
            console.log(JSON.stringify(challenge, null, 2))

            const webauthn = new WebAuthnSigner({
                relyingParty: {
                    id: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_ID!,
                    name: process.env.NEXT_PUBLIC_PASSKEYS_RELYING_PARTY_NAME!,
                },
            })
            const attestation = await webauthn.create(challenge)
            console.log(JSON.stringify(attestation, null, 2))

            // Finish delegated registration
            const completeRes = await fetch('/api/register/complete', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    signedChallenge: { firstFactorCredential: attestation },
                    temporaryAuthenticationToken: challenge.temporaryAuthenticationToken,
                }),
            })

            setResponse(await completeRes.json())
            setError(undefined)
        } catch (error: any) {
            setResponse(undefined)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={register}>
            <div className="w-full">
                <div className="flex flex-col items-center gap-5">
                    <Input type="email" name="username" placeholder="Username" className="input text-black border border-grey rounded-[10px] p-2" />
                    <Button className="btn" type="submit">
                        Register
                    </Button>
                </div>

                {!!loading && <span>registering ...</span>}

                {!!response && (
                    <pre className="p-4 drop-shadow-lg mt-2 overflow-x-scroll">{JSON.stringify(response, null, 2)}</pre>
                )}

                {!!error && <div className="text-red-700">{JSON.stringify(error)}</div>}
            </div>
        </form>
    )
}
