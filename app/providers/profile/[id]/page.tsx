import { redirect } from "next/navigation"

type Props = {
  params: Promise<{ id: string }>
}

export default async function LegacyProviderProfilePage({ params }: Props) {
  const { id } = await params
  redirect(`/providers/${encodeURIComponent(id)}`)
}

