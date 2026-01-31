import { Toaster as Sonner } from 'sonner';

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-black group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4 group-[.toaster]:font-sans',
          description: 'group-[.toast]:text-gray-500',
          actionButton:
            'group-[.toast]:bg-black group-[.toast]:text-white',
          cancelButton:
            'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-500',
          error: 'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-red-500',
          success: 'group-[.toaster]:!border-l-4 group-[.toaster]:!border-l-black',
        },
        style: {
             fontFamily: 'system-ui, -apple-system, sans-serif',
        }
      }}
      {...props}
    />
  );
};

export { Toaster };
