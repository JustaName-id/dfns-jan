'use client'

import { Input } from '@/components/ui/input'
import { FormEvent, useState } from 'react'
import { Button } from '../../ui/button'

export default function Login() {
    const [loading, setLoading] = useState(false)
    const [response, setResponse] = useState(undefined)
    const [error, setError] = useState(undefined)


    const login = async (event: FormEvent<HTMLFormElement>) => {
        try {
            setLoading(true)
            event.preventDefault()

            const formData = new FormData(event.currentTarget)

            // start delegated registration flow and obtain a challenge
            const loginRes = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                },
                body: JSON.stringify({
                    username: formData.get('username') as string,
                }),
            })

            const body = await loginRes.json()

            setResponse(body)
            setError(undefined)
        } catch (error: any) {
            setResponse(undefined)
            setError(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={login}>
            <div className="w-full">
                <div className="flex flex-col items-center gap-5">
                    <Input type="email" name="username" placeholder="Username" className="input text-black border border-grey rounded-[10px] p-2" />
                    <Button className="btn" type="submit">
                        Login
                    </Button>
                </div>

                {!!loading && <span>login ...</span>}

                {!!response && (
                    <pre className="p-4 drop-shadow-lg mt-2 overflow-x-scroll">{JSON.stringify(response, null, 2)}</pre>
                )}

                {!!error && <div className="text-red-700">{JSON.stringify(error)}</div>}
            </div>
        </form>
    )
}