'use client'

import { Input } from '@/components/ui/input'
import { useAuth } from '@/hooks/useAuth'
import { useLogin } from '@/hooks/useLogin'
import { useWallets } from '@/hooks/useWallets'
import { FormEvent } from 'react'
import { Button } from '../../ui/button'
export default function Login() {
    const { mutateAsync: login, isPending: isLoggingIn } = useLogin()
    const { isAuthenticated, refetch: refetchAuth } = useAuth()
    const { refetchWallets } = useWallets()

    const loginHandler = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)
        await login(formData.get('username') as string)
        refetchAuth()
        refetchWallets()
    }

    if (isAuthenticated) {
        return null
    }

    return (
        <div className='flex flex-col gap-3 items-center'>
            <form onSubmit={loginHandler}>
                <div className="w-full flex flex-col gap-3 items-center">
                    <p className="text-2xl font-bold">Login</p>
                    <div className="flex flex-col items-center gap-5">
                        <Input type="email" name="username" placeholder="Username" className="input text-black border border-grey rounded-[10px] p-2" />
                        <Button className="btn" type="submit">
                            Login
                        </Button>
                    </div>

                    {!!isLoggingIn && <span>logging in ...</span>}

                </div>
            </form>
            <div className="h-[1px] w-full bg-black" />
        </div>
    )
}