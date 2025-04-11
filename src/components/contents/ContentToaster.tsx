import { createRoot } from "react-dom/client"
import { Toaster } from "sonner"

const container = document.createElement("div")
document.body.appendChild(container)

const root = createRoot(container)
root.render(<Toaster position="top-center" />)
