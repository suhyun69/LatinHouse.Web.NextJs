export function RenderMessage({ 
  message, 
  isError = false 
}: { 
  message: string
  isError?: boolean 
}) {
  return (
    <div className={`flex justify-center items-center min-h-screen ${isError ? 'text-red-500' : 'text-gray-600'}`}>
      {message}
    </div>
  )
} 