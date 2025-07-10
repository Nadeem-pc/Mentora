import AuthLayout from "@/layouts/AuthLayout"
import Role from "@/components/auth/Role"

const PreAuth = () => {
    return (
        <AuthLayout 
            heading={ "Choose your role" }
            text={ "At Mentora, we're building a space where mental well-being is supported and accessible to all. Whether you're here to seek help or provide it, you're part of a mission to make a real difference." }
        >
            <Role/>
        </AuthLayout>
    )
}

export default PreAuth