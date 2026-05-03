import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Link as LinkIcon,
  Image,
  FolderOpen,
  Pencil,
  Eye,
  EyeOff,
  Trash2,
  Plus,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@shared/components/ui/button'
import { Textarea } from '@shared/components/ui/textarea'
import { usePortfolio, PortfolioItem } from '../context/PortfolioContext'
import { CVUpload } from './CVUpload'

// Sortable Item Component
/**
 * SortablePortfolioItem - React component
 * @returns React element
 */
const SortablePortfolioItem = ({
  item,
  onToggleVisibility,
  onDelete,
}: {
  item: PortfolioItem
  onToggleVisibility: (id: string) => void
  onDelete: (id: string) => void
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    /**
     * style - Utility function
     * @returns void
     */
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 rounded-xl border bg-white p-4 transition-all hover:shadow-md ${
        item.visible ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-60'
      } ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none text-slate-400 hover:text-slate-600 active:cursor-grabbing"
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Thumbnail */}
      {item.thumbnail ? (
        <img src={item.thumbnail} alt={item.title} className="h-14 w-14 rounded-lg object-cover" />
      ) : (
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100">
          {item.type === 'link' ? (
            <LinkIcon className="h-6 w-6 text-slate-400" />
          ) : item.type === 'carousel' ? (
            <Image className="h-6 w-6 text-slate-400" />
          ) : (
            <FolderOpen className="h-6 w-6 text-slate-400" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="truncate font-semibold text-slate-900">{item.title}</h3>
          <Pencil className="h-3.5 w-3.5 cursor-pointer text-slate-400 hover:text-slate-600" />
        </div>
        <p className="truncate text-sm text-slate-500">{item.url}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => window.open(item.url, '_blank')}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title="Open link"
        >
          <ExternalLink className="h-4 w-4" />
        </button>
        <button
          onClick={() => onToggleVisibility(item.id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          title={item.visible ? 'Hide' : 'Show'}
        >
          {item.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export const PortfolioContent = () => {
  const {
    biography,
    setBiography,
    statement,
    setStatement,
    /**
     * PortfolioContent - React component
     * @returns React element
     */
    items,
    setItems,
    cvFileName,
    setCvFileName,
    salesGraphVisible,
    setSalesGraphVisible,
  } = usePortfolio()

  const maxBioLength = 1000
  const maxStatementLength = 1000

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )
  /**
   * maxBioLength - Utility function
   * @returns void
   */

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    /**
     * maxStatementLength - Utility function
     * @returns void
     */
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id)
      const newIndex = items.findIndex((item) => item.id === over.id)
      setItems(arrayMove(items, oldIndex, newIndex))
    }
    /**
     * sensors - Utility function
     * @returns void
     */
  }

  const toggleVisibility = (id: string) => {
    setItems(items.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item)))
  }

  const deleteItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  /**
   * handleDragEnd - Utility function
   * @returns void
   */
  return (
    <div className="flex-1 space-y-6 overflow-y-auto py-6 pr-4">
      {/* Biography Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-center text-xl font-bold text-slate-900">Biography</h2>
        <p className="mb-4 text-center text-sm text-slate-500">Tell the world more about you</p>
        /** * oldIndex - Utility function * @returns void */
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-600">
            Biography (Synced with your profile)
          </label>
          <Textarea
            value={biography}
            /**
             * newIndex - Utility function
             * @returns void
             */
            onChange={(e) => setBiography(e.target.value.slice(0, maxBioLength))}
            placeholder="Write your biography..."
            className="min-h-[100px] resize-none rounded-lg border-slate-200"
          />
          <p className="text-right text-xs text-slate-400">
            {biography.length}/{maxBioLength} characters
          </p>
        </div>
        /** * toggleVisibility - Utility function * @returns void */
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-3">
        <Button className="flex h-11 items-center justify-center gap-2 bg-[#0066FF] text-white hover:bg-[#0052CC]">
          <Plus className="h-4 w-4" />
          Add link /** * deleteItem - Utility function * @returns void */
        </Button>
        <Button className="flex h-11 items-center justify-center gap-2 bg-[#0066FF] text-white hover:bg-[#0052CC]">
          <Image className="h-4 w-4" />
          Add carousel
        </Button>
        <Button
          variant="outline"
          className="flex h-11 items-center justify-center gap-2 border-slate-200"
        >
          <FolderOpen className="h-4 w-4" />
          Add collection
        </Button>
      </div>

      {/* Featured Items List with Drag & Drop */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {items.map((item) => (
              <SortablePortfolioItem
                key={item.id}
                item={item}
                onToggleVisibility={toggleVisibility}
                onDelete={deleteItem}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <FolderOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">No items yet</h3>
          <p className="mt-1 text-sm text-slate-500">
            Start building your portfolio by adding links, carousels, or collections.
          </p>
        </div>
      )}

      {/* CV Section */}
      <CVUpload cvFileName={cvFileName} onFileChange={setCvFileName} />

      {/* Statement Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-center text-xl font-bold text-slate-900">Statement</h2>
        <p className="mb-4 text-center text-sm text-slate-500">
          Share the story behind your works.
        </p>

        <div className="space-y-2">
          <div className="relative">
            <Textarea
              value={statement}
              onChange={(e) => setStatement(e.target.value.slice(0, maxStatementLength))}
              placeholder="Write your statement"
              className="min-h-[100px] resize-none rounded-lg border-slate-200 pr-10"
            />
            <Pencil className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
          </div>
          <p className="text-right text-xs text-slate-400">
            {statement.length}/{maxStatementLength} characters
          </p>
        </div>
      </div>

      {/* Artworks Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-1 text-center text-xl font-bold text-slate-900">Artworks</h2>
        <p className="text-center text-sm text-slate-500">
          The artwork order here syncs directly with your profile view, reflecting changes across
          both Portfolio and profile displays.
        </p>
      </div>

      {/* Sales Graph Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1 text-center">
            <h2 className="mb-1 text-xl font-bold text-slate-900">Sales Graph</h2>
            <p className="text-sm text-slate-500">
              Your Sales Graph is{' '}
              <span className="font-semibold">{salesGraphVisible ? 'visible' : 'invisible'}</span>{' '}
              and can be controlled in the Sales tab
            </p>
          </div>
          <button
            onClick={() => setSalesGraphVisible(!salesGraphVisible)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            title={salesGraphVisible ? 'Hide' : 'Show'}
          >
            {salesGraphVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
