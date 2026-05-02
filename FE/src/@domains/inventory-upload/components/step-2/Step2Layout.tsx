// @shared - components
import { Button } from '@shared/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select'
import { Textarea } from '@shared/components/ui/textarea'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - inventory upload
import { UPLOAD_TAG_OPTIONS } from '@domains/inventory-upload/constants/uploadTagOptions'
import { UPLOAD_TRIVIA_QUESTIONS } from '@domains/inventory-upload/constants/uploadTriviaQuestions'
import { VideoPicker } from '@domains/inventory-upload/components/step-1/VideoPicker'
import {
  UPLOAD_MEDIA_RULES,
  useUploadArtworkStore,
} from '@domains/inventory-upload/stores/useUploadArtworkStore'

const SECTION_TITLE_CLASSNAME =
  'text-[13px] font-extrabold uppercase tracking-[0.05em] text-black/50 lg:text-[17px]'
const LABEL_CLASSNAME =
  'text-[11px] font-semibold uppercase tracking-[0.2em] text-black/50 lg:text-[12px]'
const TEXTAREA_BASE_CLASSNAME = 'min-h-[140px] text-[15px] lg:min-h-[160px] lg:text-[16px]'
const QUICK_FACT_PLACEHOLDER_VALUE = '__placeholder__'
const QUICK_FACT_PLACEHOLDER_LABEL = 'Select a question'

type Step2LayoutProps = {
  className?: string
}

type Step2ColumnProps = {
  className?: string
}

type TagGroupProps = {
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}

const TagGroup = ({ label, options, selected, onToggle }: TagGroupProps) => {
  return (
    <div>
      <p className={LABEL_CLASSNAME}>{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = selected.includes(option)
          return (
            <Button
              key={option}
              type="button"
              variant="outline"
              size="xs"
              onClick={() => onToggle(option)}
              className={cn(
                'h-[36px] rounded-full border px-4! py-4! text-[10px] font-semibold tracking-[0.18em] uppercase transition lg:h-[38px] lg:text-[12px]',
                isSelected
                  ? '!border-[#0F6BFF] !bg-[#0F6BFF] !text-white'
                  : 'border-black! text-black/60 hover:border-[#0F6BFF] hover:text-[#0F6BFF]',
              )}
            >
              {option}
            </Button>
          )
        })}
      </div>
    </div>
  )
}

const Step2LeftColumn = ({ className }: Step2ColumnProps) => {
  // -- state --
  const tags = useUploadArtworkStore((state) => state.story.tags)
  const toggleTag = useUploadArtworkStore((state) => state.toggleTag)

  return (
    <div className={cn('space-y-4 lg:space-y-8', className)}>
      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={SECTION_TITLE_CLASSNAME}>Artwork tags</p>
        <div className="mt-4 space-y-6">
          <TagGroup
            label="Vibes"
            options={UPLOAD_TAG_OPTIONS.vibes}
            selected={tags.vibes}
            onToggle={(value) => toggleTag('vibes', value)}
          />
          <TagGroup
            label="Values"
            options={UPLOAD_TAG_OPTIONS.values}
            selected={tags.values}
            onToggle={(value) => toggleTag('values', value)}
          />
          <TagGroup
            label="Mediums"
            options={UPLOAD_TAG_OPTIONS.mediums}
            selected={tags.mediums}
            onToggle={(value) => toggleTag('mediums', value)}
          />
        </div>
      </div>
    </div>
  )
}

const Step2RightColumn = ({ className }: Step2ColumnProps) => {
  // -- state --
  const media = useUploadArtworkStore((state) => state.media)
  const story = useUploadArtworkStore((state) => state.story)
  const errors = useUploadArtworkStore((state) => state.errors)
  const touched = useUploadArtworkStore((state) => state.touched)
  const hasSubmitted = useUploadArtworkStore((state) => state.hasSubmitted)
  
  const setMomentVideo = useUploadArtworkStore((state) => state.setMomentVideo)
  const setField = useUploadArtworkStore((state) => state.setField)
  const trivias = useUploadArtworkStore((state) => state.story.trivia)
  const addTrivia = useUploadArtworkStore((state) => state.addTrivia)
  const updateTrivia = useUploadArtworkStore((state) => state.updateTrivia)
  const removeTrivia = useUploadArtworkStore((state) => state.removeTrivia)
  const markFieldTouched = useUploadArtworkStore((state) => state.markFieldTouched)

  const shouldShowError = (field: string) => Boolean(errors[field]) && (hasSubmitted || touched[field])

  return (
    <div className={cn('space-y-4 lg:space-y-8', className)}>
      <VideoPicker
        video={media.momentVideo ?? undefined}
        error={shouldShowError('media.momentVideo') ? errors['media.momentVideo'] : undefined}
        accept={UPLOAD_MEDIA_RULES.VIDEO_ACCEPT}
        maxSizeLabel={`${UPLOAD_MEDIA_RULES.MAX_VIDEO_SIZE_MB}MB`}
        title="Artwork moments"
        description="Upload moments of your artwork."
        helperText="Supported formats: MOV, MP4, WEBM. Maximum duration: 60 seconds."
        mode="moments"
        caption={story.moment.caption}
        videoType={story.moment.type}
        onCaptionChange={(value) => {
          setField('story.moment.caption', value)
          markFieldTouched('story.moment.caption')
        }}
        onVideoTypeChange={(value) => {
          setField('story.moment.type', value)
          markFieldTouched('story.moment.type')
        }}
        onSelect={setMomentVideo}
        onRemove={() => setMomentVideo(null)}
      />

      <div className="rounded-4xl border border-black/10 bg-white p-4 lg:p-6">
        <p className={SECTION_TITLE_CLASSNAME}>Quick facts</p>
        <div className="mt-4 space-y-4">
          {trivias.map((trivia, index) => {
            const answerErrorKey = `story.trivia.${trivia.id}.answer`
            const hasAnswerError = shouldShowError(answerErrorKey)
            const isQuestionPlaceholder = !trivia.question
            return (
              <div key={trivia.id} className="rounded-2xl border border-black/10 bg-[#FDFDFD] p-4">
                <div className="flex items-center justify-between">
                  <p className={LABEL_CLASSNAME}>Question {index + 1}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTrivia(trivia.id)}
                  >
                    Remove
                  </Button>
                </div>
                <Select
                  value={trivia.question || QUICK_FACT_PLACEHOLDER_VALUE}
                  onValueChange={(value) =>
                    updateTrivia(
                      trivia.id,
                      'question',
                      value === QUICK_FACT_PLACEHOLDER_VALUE ? '' : value,
                    )
                  }
                >
                  <SelectTrigger
                    className={cn(
                      'mt-3 h-14 rounded-[18px] border-black/10 px-5 text-[16px] !text-[#191414] data-[placeholder]:text-[#9A9A9A]',
                      isQuestionPlaceholder && '!text-[#9A9A9A]',
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[220] rounded-[18px] border border-black/10 bg-white p-0 text-[#191414] shadow-[0_16px_40px_rgba(0,0,0,0.08)] [&_[data-radix-select-viewport]]:h-auto [&_[data-radix-select-viewport]]:max-h-[320px] [&_[data-radix-select-viewport]]:overflow-y-auto [&_[data-radix-select-viewport]]:p-0">
                    <SelectItem
                      value={QUICK_FACT_PLACEHOLDER_VALUE}
                      className="rounded-none border-b border-black/10 px-5 py-4 text-[16px] !text-[#9A9A9A] focus:bg-[#F5F5F5] focus:!text-[#9A9A9A] data-[state=checked]:!text-[#9A9A9A] [&>span:first-child]:hidden"
                    >
                      {QUICK_FACT_PLACEHOLDER_LABEL}
                    </SelectItem>
                    {UPLOAD_TRIVIA_QUESTIONS.map((question) => (
                      <SelectItem
                        key={question}
                        value={question}
                        className="rounded-none border-b border-black/10 px-5 py-4 text-[16px] !text-[#191414] last:border-b-0 focus:bg-[#F5F5F5] focus:!text-[#191414] data-[state=checked]:!text-[#191414] [&>span:first-child]:hidden"
                      >
                        {question}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="mt-2 text-sm text-[#898788]">
                  Select a question from the dropdown to share more insights.
                </p>
                <div className="mt-3">
                  <Textarea
                    value={trivia.answer}
                    onChange={(event) => updateTrivia(trivia.id, 'answer', event.target.value)}
                    onBlur={() => markFieldTouched(answerErrorKey)}
                    placeholder="Share more context..."
                    className={TEXTAREA_BASE_CLASSNAME}
                    aria-invalid={hasAnswerError}
                  />
                  {hasAnswerError ? <p className="mt-2 text-sm text-red-600">{errors[answerErrorKey]}</p> : null}
                </div>
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" size="sm" onClick={addTrivia}>
            Add another
          </Button>
          <span className="text-sm text-[#898788]">
            {trivias.length} {trivias.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>
      </div>
    </div>
  )
}

export const Step2Layout = ({ className }: Step2LayoutProps) => {
  return (
    <section className={cn('mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-8', className)}>
      <Step2LeftColumn />
      <Step2RightColumn />
    </section>
  )
}

export { Step2LeftColumn, Step2RightColumn }
