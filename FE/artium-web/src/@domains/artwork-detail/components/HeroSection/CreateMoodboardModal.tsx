'use client'

import { useEffect, useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@shared/components/ui/dialog'
import { Input } from '@shared/components/ui/input'
import { Label } from '@shared/components/ui/label'

export const MAX_MOODBOARD_NAME = 24

type CreateMoodboardModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (name: string) => void
}

export const CreateMoodboardModal = ({ open, onOpenChange, onCreate }: CreateMoodboardModalProps) => {
    const [name, setName] = useState('')

    useEffect(() => {
        if (!open) {
            setName('')
        }
    }, [open])

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            setName('')
        }
        onOpenChange(nextOpen)
    }

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault()
        const trimmed = name.trim()
        if (!trimmed) return
        onCreate(trimmed)
    }

    const nameIsValid = name.trim().length > 0

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-md rounded-[28px] border border-slate-200 bg-white/95 p-6 sm:p-7 shadow-[0_25px_70px_rgba(15,23,42,0.32)] backdrop-blur-3xl"
                overlayClassName="bg-slate-900/70 backdrop-blur-3xl backdrop-saturate-150"
            >
                <DialogHeader className="text-center">
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                        Create a New Moodboard
                    </DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label
                            htmlFor="moodboard-name"
                            className="text-xs font-semibold uppercase text-slate-500"
                        >
                            Moodboard Name
                        </Label>
                        <Input
                            id="moodboard-name"
                            value={name}
                            onChange={(event) =>
                                setName(event.target.value.slice(0, MAX_MOODBOARD_NAME))
                            }
                            placeholder="Enter new moodboard name"
                            maxLength={MAX_MOODBOARD_NAME}
                            className="h-11 rounded-xl border-slate-200 text-sm text-slate-900 placeholder:text-slate-400"
                        />
                        <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="flex items-center gap-1 text-slate-500">
                                <Info className="h-4 w-4" />
                                This Moodboard will be shown on your public profile
                            </span>
                            <span>
                                {name.length}/{MAX_MOODBOARD_NAME}
                            </span>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="submit"
                            disabled={!nameIsValid}
                            className="w-full rounded-full bg-blue-500 px-4 text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-blue-200"
                        >
                            Create &amp; Save
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
