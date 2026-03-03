# Templates

## 1. Domain Component Template
`src/@domains/inventory/components/MyNewComponent/index.tsx`

```tsx
import { useCallback, useMemo } from 'react'
import classNames from 'classnames'

// @shared - components
import { Button } from '@shared/components/ui/button'
import { Text } from '@shared/components/Text'

type MyNewComponentProps = {
  title: string
  isActive?: boolean
  onAction: () => void
}

export const MyNewComponent = ({
  title,
  isActive = false,
  onAction,
}: MyNewComponentProps) => {
  // -- handlers --
  const handleClick = useCallback(() => {
    onAction()
  }, [onAction])

  return (
    <div className={classNames('flex flex-col p-4', isActive && 'bg-blue-50')}>
      <Text className="text-lg font-bold">{title}</Text>
      <Button onClick={handleClick} variant="secondary">
        Click Me
      </Button>
    </div>
  )
}

export default MyNewComponent
```

## 2. Page Wrapper Template
`src/pages/artist/my-feature/index.tsx`

```tsx
import dynamic from 'next/dynamic'
import useAuth from 'hooks/authentication/useAuth'
import useCheckingRole from 'shared/hooks/data-fetching/useCheckingRole'
import AccessDeniedView from 'shared/components/error/AccessDeniedView'
import Header from '@shared/components/layout/Header'
import Metadata from 'shared/components/Metadata'
import withDesktopSidebar from 'shared/utils/withDesktopSidebar'
import SpinnerIcon from 'shared/icons/SpinnerIcon'

// Dynamic import for the main view
const MyFeaturePageContent = dynamic(
  () => import('@src/pages/userDashboard/MyFeature/MyFeaturePage'),
  { ssr: false }
)

const MyFeaturePage = () => {
  const { authUser, isFetching: isAuthFetching } = useAuth({ redirectTo: '/login' })
  const { isUserCreator, isFetchingRoleMap } = useCheckingRole(authUser?.role)

  if (isAuthFetching || isFetchingRoleMap) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <SpinnerIcon className="!h-[50px] !w-[50px]" />
      </div>
    )
  }

  return (
    <AccessDeniedView
      metadata={<Metadata title="My Feature | art" />}
      header={<Header />}
      canView={isUserCreator}
    >
      <div className="h-full p-7 !pt-24 md:p-6">
        {authUser && (
          <div className="w-full pb-10 pt-2">
            <MyFeaturePageContent />
          </div>
        )}
      </div>
    </AccessDeniedView>
  )
}

export default withDesktopSidebar(MyFeaturePage)
```

## 3. Data Fetching Hook Template
`src/@domains/inventory/hooks/useGetMyData.ts`

```ts
import { useMemo } from 'react'
import artworkApis from '@shared/apis/artworkApis' // or relevant api
import { createUsePaginationQueryV2 } from '@shared/utils/reactQuery'

export const queryKey = ['useGetMyData']

export const queryFn = (queryParams: any) => {
  return artworkApis.getSomeData(queryParams)
}

export const useGetMyData = (search: string) => {
  const queryParams = useMemo(() => ({ search }), [search])
  
  // Use the shared factory or standard useSWR/useQuery
  return createUsePaginationQueryV2({
    queryKey: [...queryKey, search],
    queryFn,
    queryParams,
    defaultPageSize: 20
  })
}
```
