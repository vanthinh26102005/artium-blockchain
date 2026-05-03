'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { useForm, useWatch } from 'react-hook-form'
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
import {
    createMoodboardNameSchema,
    MAX_MOODBOARD_NAME,
    type CreateMoodboardNameFormValues,
} from '@domains/profile/validations/profileForms.schema'

type CreateMoodboardModalProps = {
    open: boolean
    onOpenChange: (open: boolean) => void
    onCreate: (name: string) => void | Promise<void>
}

/**
 * CreateMoodboardModal - React component
 * @returns React element
 */
export const CreateMoodboardModal = ({ open, onOpenChange, onCreate }: CreateMoodboardModalProps) => {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
        control,
    } = useForm<CreateMoodboardNameFormValues>({
        resolver: zodResolver(createMoodboardNameSchema),
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: {
            name: '',
        },
    })
    const name = useWatch({ control, name: 'name' }) ?? ''
    const nameField = register('name')

/**
 * name - Utility function
 * @returns void
 */
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) {
            reset()
        }
/**
 * nameField - Utility function
 * @returns void
 */
        onOpenChange(nextOpen)
    }

    const handleCreateMoodboard = async ({ name }: CreateMoodboardNameFormValues) => {
        await onCreate(name.trim())
/**
 * handleOpenChange - Utility function
 * @returns void
 */
        reset()
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className="max-w-md rounded-[28px] border border-slate-200 bg-white/95 p-6 sm:p-7 shadow-[0_25px_70px_rgba(15,23,42,0.32)] backdrop-blur-3xl"
                overlayClassName="bg-slate-900/70 backdrop-blur-3xl backdrop-saturate-150"
            >
                <DialogHeader className="text-center">
/**
 * handleCreateMoodboard - Utility function
 * @returns void
 */
                    <DialogTitle className="text-xl font-semibold text-slate-900">
                        Create a New Moodboard
                    </DialogTitle>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit(handleCreateMoodboard)}>
                    <div className="space-y-2">
                        <Label
                            htmlFor="moodboard-name"
                            className="text-xs font-semibold uppercase text-slate-500"
                        >
                            Moodboard Name
                        </Label>
                        <Input
                            id="moodboard-name"
                            placeholder="Enter new moodboard name"
                            maxLength={MAX_MOODBOARD_NAME}
                            className="h-11 rounded-xl border-slate-200 text-sm text-slate-900 placeholder:text-slate-400"
                            {...nameField}
                        />
                        {errors.name?.message ? (
                            <p className="text-sm text-rose-500">{errors.name.message}</p>
                        ) : null}
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
                            disabled={isSubmitting}
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
