"use client";
export const dynamic = 'force-dynamic';
import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://127.0.0.1:4000";

export default function KayseriTip(){
  const [watermark,setWatermark] = useState('');
  const [src,setSrc] = useState('');

  useEffect(()=>{ /* init */ },[]);

  return (
    <div className="p-4">
      KayseriTIP iÃ§erikleri (Ã¶rnek)
    </div>
  );
}






