'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/hooks/useAuth"
import { useRegister } from "@/hooks/useRegister"
import { useWallets } from "@/hooks/useWallets"
import { FormEvent } from "react"

export default function RegisterUser() {
    const { mutate: register, isPending: isRegistering } = useRegister()
    const { refetch } = useAuth()
    const { refetchWallets } = useWallets()

    const registerHandler = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        register(formData.get('username') as string)
        refetch()
        refetchWallets()
    }
    return (
        <div className='flex flex-col gap-3 items-center'>
            <form onSubmit={registerHandler}>
                <div className="w-full flex flex-col gap-3 items-center">
                    <p className="text-2xl font-bold">Register</p>
                    <div className="flex flex-col items-center gap-5">
                        <Input type="email" name="username" placeholder="Username" className="input text-black border border-grey rounded-[10px] p-2" />
                        <Button className="btn" type="submit" disabled={isRegistering}>
                            Register
                        </Button>
                    </div>

                    {!!isRegistering && <span>registering ...</span>}
                </div>
            </form>
            <div className="h-[1px] w-full bg-black" />
        </div>
    )
}
