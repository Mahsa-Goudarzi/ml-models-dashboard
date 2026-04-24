// components
import DropZone from "@/components/upload/DropZone";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-tertiary)] px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-[32px] font-medium tracking-tight text-[var(--text-primary)]">
          ML<span className="text-[#7F77DD]">ens</span>
        </h1>
        <p className="text-[14px] text-[var(--text-secondary)] mt-1">
          upload · explore · train · visualize · all in your browser
        </p>
      </div>
      <DropZone />
    </div>
  );
}
