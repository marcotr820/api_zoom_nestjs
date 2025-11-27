import { MeetingEndedEventDto } from "./meeting-ended.dto";
import { MeetingStartedEventDto } from "./meeting-started.dto";
import { RecordingCompletedEventDto } from "./recording-completed.dto";
import { RecordingStartedEventDto } from "./recording-started.dto";
import { RecordingStoppedEventDto } from "./recording-stopped.dto";
import { SummaryCompletedEventDto } from "./summary-completed.dto";
import { TranscriptCompletedEventDto } from "./transcript-completed.dto";
import { ZoomUrlValidationEventDto } from "./url-validation.dto";

export type ZoomWebhookEventDto =
  | ZoomUrlValidationEventDto
  | RecordingStartedEventDto
  | RecordingStoppedEventDto
  | MeetingStartedEventDto
  | MeetingEndedEventDto
  | RecordingCompletedEventDto
  | SummaryCompletedEventDto
  | TranscriptCompletedEventDto;
