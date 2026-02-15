import {
  DashboardHeader,
  DashboardHeaderDescription,
  DashboardHeaderTitle,
} from "../../dashboard-header";
import SpeechRecognitionClient from "./speech-recognition-client";

export default async function SpeechRecognitionPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <DashboardHeader>
        <div className="flex w-full items-center justify-between">
          <div>
            <DashboardHeaderTitle>Transcripción de voz</DashboardHeaderTitle>
            <DashboardHeaderDescription>
              Escribe un texto de referencia y compáralo con una transcripción
              de voz
            </DashboardHeaderDescription>
          </div>
        </div>
      </DashboardHeader>
      <SpeechRecognitionClient />
    </div>
  );
}
