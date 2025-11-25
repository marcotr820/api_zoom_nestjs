export interface ZoomMeetingDetails {
  uuid: string;
  id: number;
  host_id: string;
  created_at: string;
  status: string;
  host_email?: string;
}

// ===========================================================
// ZOOM ENDPOINT VALIDATION 
// ===========================================================
export interface ZoomUrlValidation extends ZoomEventBase {
  event: 'endpoint.url_validation';
  payload: ZoomEventBase["payload"] & {
    // * con ZoomEventBase["payload"] cargamos el payload del padre
    // * y con plainToken: string lo volvemos obligatorio
    plainToken: string;
  };
}

// ===========================================================
// RESPONSE GET RECORDINGS download_url
// ===========================================================
export interface ZoomRecording {
  id: string;
  meeting_id: string;
  recording_start: string; // ISO date string
  recording_end: string;   // ISO date string
  file_type: string;
  file_extension: string;
  file_size: number;
  play_url?: string;       // Opcional, no todos los tipos tienen play_url
  download_url: string;
  status: string;
  recording_type: string;
}

// ===========================================================
// RESPONSE GET TOKEN WITH CREDENTIALS APP
// ===========================================================
export interface ZoomTokenData {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  api_url: string;
}

// ===========================================================
// BASE
// ===========================================================
export interface ZoomEventBase {
  event: string;
  event_ts: number;
  payload: {
    account_id: string;
    object: any;
    plainToken?: string;
  };
}

// ===========================================================
// RECORDING FILES (estructura genérica)
// ===========================================================
export interface RecordingFileInfo {
  id?: string/*| number*/;
  recording_start?: string;
  recording_end?: string;
  file_type?: string;
  file_size?: number;
  file_extension: string;
  download_url: string;
  status?: string;
  play_url?: string;
  recording_type?: string; // TODO mio
  encryption_fingerprint?: string; //TODO mio
  //[key: string]: any; // porque Zoom envía muchos formatos distintos
}

// ===========================================================
// MEETING.STARTED
// ===========================================================
export interface MeetingStartedObject {
  duration: number;
  start_time: string;
  timezone: string;
  topic: string;
  id: string;
  type: number;
  uuid: string;
  host_id: string;
}

export interface MeetingStartedEvent extends ZoomEventBase {
  event: "meeting.started";
  payload: {
    account_id: string;
    object: MeetingStartedObject;
  };
}

// ===========================================================
// RECORDING.RESUMED
// ===========================================================
export interface RecordingResumedObject {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  duration: number;
  recording_file: RecordingFileInfo | RecordingFileInfo[];
}

export interface RecordingResumedEvent extends ZoomEventBase {
  event: "recording.resumed";
  payload: {
    account_id: string;
    object: RecordingResumedObject;
  };
}

// ===========================================================
// RECORDING.STARTED
// ===========================================================
export interface RecordingStartedObject {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  duration: number;
  recording_file: RecordingFileInfo | RecordingFileInfo[];
}

export interface RecordingStartedEvent extends ZoomEventBase {
  event: "recording.started";
  payload: {
    account_id: string;
    object: RecordingStartedObject;
  };
}

// ===========================================================
// RECORDING.PAUSED
// ===========================================================
export interface RecordingPausedObject {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  duration: number;
  recording_file: RecordingFileInfo | RecordingFileInfo[];
}

export interface RecordingPausedEvent extends ZoomEventBase {
  event: "recording.paused";
  payload: {
    account_id: string;
    object: RecordingPausedObject;
  };
}

// ===========================================================
// RECORDING.STOPPED
// ===========================================================
export interface RecordingStoppedObject {
  uuid: string;
  id: number;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  duration: number;
  recording_file: RecordingFileInfo | RecordingFileInfo[];
}

export interface RecordingStoppedEvent extends ZoomEventBase {
  event: "recording.stopped";
  payload: {
    account_id: string;
    object: RecordingStoppedObject;
  };
}

// ===========================================================
// SUMMARY.COMPLETED
// ===========================================================
export interface SummaryCompletedObject {
  meeting_uuid: string;
  meeting_topic: string;
  summary_title: string;
  summary_content: string;
  [key: string]: any;
}

export interface SummaryCompletedEvent extends ZoomEventBase {
  event: 'meeting.summary_completed';
  payload: {
    account_id: string;
    object: SummaryCompletedObject;
  };
}

// ===========================================================
// TRANSCRIPT.COMPLETED
// ===========================================================
export interface TranscriptCompletedRecFiles {
  id: number;
  meeting_id: string;
  file_type: string;
  file_extension: string;
  file_size: number;
  download_url: string;
  [key: string]: any;
}

export interface TranscriptCompletedObject {
  uuid: string;
  id: number;
  recording_files: TranscriptCompletedRecFiles[];
  [key: string]: any;
}

export interface TranscriptCompletedEvent extends ZoomEventBase {
  event: 'recording.transcript_completed';
  payload: {
    account_id: string;
    object: TranscriptCompletedObject
  };
  download_token: string;
}

// ===========================================================
// RECORDING.COMPLETED
// ===========================================================
export interface RecordingCompletedObject {
  uuid: string;
  id: number;
  account_id: string;
  host_id: string;
  topic: string;
  type: number;
  start_time: string;
  timezone: string;
  host_email: string;
  duration: number;
  total_size: number;
  recording_count: number;
  share_url: string;
  recording_files: RecordingFileInfo[];
  password: string;
  recording_play_passcode: string;
  on_prem: boolean;
}

export interface RecordingCompletedEvent extends ZoomEventBase {
  event: "recording.completed";
  download_token: string;
  payload: {
    account_id: string;
    object: RecordingCompletedObject;
  };
}

// ===========================================================
// MEETING.ENDED
// ===========================================================
export interface MeetingEndedObject {
  duration: number;
  start_time: string;
  timezone: string;
  end_time: string;
  topic: string;
  id: string;
  type: number;
  uuid: string;
  host_id: string;
}

export interface MeetingEndedEvent extends ZoomEventBase {
  event: "meeting.ended";
  payload: {
    account_id: string;
    object: MeetingEndedObject;
  };
  //TODO event_ts: se hereda de ZoomEventBase
}

// ===========================================================
// UNIÓN DE TODOS LOS EVENTOS QUE PROPORCIONASTE
// ===========================================================
export type ZoomWebhookEvent =
  | ZoomUrlValidation
  | MeetingStartedEvent
  | MeetingEndedEvent
  | RecordingPausedEvent
  | RecordingResumedEvent
  | RecordingStartedEvent
  | RecordingStoppedEvent
  | SummaryCompletedEvent
  | TranscriptCompletedEvent
  | RecordingCompletedEvent;
