# Import Order & Grouping

Imports must be organized logically to maintain readability. The Inventory domain follows this strict order:

## 1. Grouping Order

1.  **React & Standard Libraries:**
    `react`, `react-dom`, `next/*`
2.  **Third-Party Libraries:**
    `lodash`, `classnames`, `framer-motion`, `@heroicons/*`, `jotai`
3.  **Shared Internal Modules:**
    -   **Modals:** `useModal`, specific modals
    -   **Components:** `@shared/components/*`
    -   **UI Primitives:** `@shared/components/ui/*`
    -   **Constants/Enums:** `@shared/constants/*`, `@shared/enums/*`
    -   **States:** `@shared/states/*`
4.  **Domain Modules:**
    `@domains/inventory/*` (Hooks, Components, Tables)
5.  **Services/APIs/Analytics:**
    `shared/services/*`, `hooks/*`
6.  **Utils:**
    `utils/*`
7.  **Local/Relative Imports:**
    `./Component`, `../Wrapper`

## 2. Canonical Example

```tsx
import { useCallback, useState, useMemo } from 'react'
import classNames from 'classnames'
import { useQueryClient } from '@tanstack/react-query'
import { useAtomValue } from 'jotai'

// icons
import { PlusCircleIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline'

// @shared - modals
import useModal from '@shared/modals'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Text } from '@shared/components/Text'

// @shared - constants
import { VIEW_MOD_TYPES } from '@shared/constants/viewModeTypes'

// @shared - states
import { InventorySelectedArtworkIdsState } from '@shared/states/InventorySelectedArtworkState'

// @domains - inventory
import InventoryArtworkTable from '@domains/inventory/tables/InventoryArtworkTable'
import CreateFolderModal from '@domains/inventory/modals/CreateFolderModal'

// shared - services
import { trackEvent } from 'shared/services/analytics/google'

// hooks
import useAuth from 'hooks/authentication/useAuth'

// utils
import { openRelativeLink } from 'utils/common'

// local
import InventoryBulkActions from '../InventoryBulkActions'
```

## 3. Rules
-   **Comments:** Use comment headers like `// @shared - components` to separate distinct groups.
-   **Aliases:** Always use `@shared`, `@domains`, `hooks`, `utils` aliases instead of deep relative paths (e.g., `../../../../shared`).
-   **Destructuring:** Prefer named imports.
