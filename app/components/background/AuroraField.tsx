import { memo } from 'react';

/** Layered gold aurora blobs + fine blueprint dot-grid — desktop ambient background */
export const AuroraField = memo(function AuroraField() {
  return (
    <div className="aurora-field absolute inset-0 overflow-hidden" aria-hidden>
      <div className="aurora-dot-grid absolute inset-0" />

      <div className="aurora-blob aurora-blob-a absolute -top-[15%] -left-[10%] h-[60vw] w-[60vw] rounded-full" />
      <div className="aurora-blob aurora-blob-b absolute -bottom-[20%] -right-[10%] h-[55vw] w-[55vw] rounded-full" />
      <div className="aurora-blob aurora-blob-c absolute top-[30%] left-[45%] h-[38vw] w-[38vw] rounded-full" />
      <div className="aurora-blob aurora-blob-d absolute -bottom-[10%] -left-[5%] h-[32vw] w-[32vw] rounded-full" />

      <div className="aurora-sweep absolute inset-0" />
    </div>
  );
});
