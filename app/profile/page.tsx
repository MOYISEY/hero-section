import { ProfileForm } from "@/components/profile/profile-form"
import { MyProjects } from "@/components/profile/my-projects"

export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-[1320px] px-6 py-16 lg:px-10 lg:py-24">
      <ProfileForm />
      <MyProjects />
    </section>
  )
}
