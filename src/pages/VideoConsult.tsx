import { useEffect } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { DOCTORS } from "@/data/doctors";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShieldCheck, Video } from "lucide-react";

const VideoConsult = () => {
  const { roomId = "desolmed-room" } = useParams();
  const [params] = useSearchParams();
  const doctorId = params.get("doctor") ?? "";
  const name = params.get("name") ?? "Patient";
  const dateLabel = params.get("date") ?? "";
  const time = params.get("time") ?? "";

  const doctor = DOCTORS.find((d) => d.id === doctorId);

  useEffect(() => { document.title = `Live consultation - DesolMed Hospital`; }, []);

  // Jitsi Meet iframe — free, no API key needed
  const jitsiSrc = `https://meet.jit.si/${encodeURIComponent(roomId)}#userInfo.displayName=${encodeURIComponent(name)}&config.prejoinPageEnabled=false`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display font-bold text-primary">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Video className="h-5 w-5" />
            </span>
            DesolMed Hospital
          </Link>
          <Button asChild variant="ghost" size="sm">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" /> End & exit</Link>
          </Button>
        </div>
      </header>

      <div className="container py-4">
        <div className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
          <span className="flex items-center gap-2 font-semibold text-primary">
            <ShieldCheck className="h-4 w-4 text-secondary" /> Secure consultation
          </span>
          {doctor && <span className="text-muted-foreground">With <strong className="text-foreground">{doctor.name}</strong> · {doctor.specialty}</span>}
          {dateLabel && <span className="text-muted-foreground">{dateLabel} · {time}</span>}
          <span className="text-muted-foreground ml-auto">Room: <code className="text-xs">{roomId}</code></span>
        </div>
      </div>

      <main className="flex-1 container pb-6">
        <div className="relative w-full h-[calc(100vh-220px)] min-h-[480px] rounded-2xl overflow-hidden border border-border bg-black shadow-elegant">
          <iframe
            src={jitsiSrc}
            title="Video consultation"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            className="w-full h-full border-0"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-3 text-center">
          Powered by Jitsi Meet · End-to-end secure video. Allow camera & microphone when prompted.
        </p>
      </main>
    </div>
  );
};

export default VideoConsult;
