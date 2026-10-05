export function AlerteLieu({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="mt-4 flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900"
    >
      <span aria-hidden className="text-lg leading-none">
        ⚠️
      </span>
      <p>
        <span className="font-semibold">Attention : </span>
        {message}
      </p>
    </div>
  );
}
