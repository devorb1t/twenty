import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import {
  extractFolderPathFilenameAndTypeOrThrow,
  isDefined,
} from 'twenty-shared/utils';
import { type WorkflowAttachment } from 'twenty-shared/workflow';

import { MAX_ATTACHMENT_SIZE } from '@/advanced-text-editor/utils/maxAttachmentSize';
import { UPLOAD_EMAIL_ATTACHMENT_FILE } from '@/file/graphql/mutations/uploadEmailAttachmentFile';
import { formatFileSize } from '@/file/utils/formatFileSize';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { logError } from '~/utils/logError';

// Email attachment uploads return the same `FileWithSignedUrlDTO` shape as
// every other typed upload mutation; we declare it locally to avoid depending
// on a codegen-generated document for this mutation (see comment in
// uploadEmailAttachmentFile.ts).
type UploadEmailAttachmentFileResponse = {
  uploadEmailAttachmentFile: {
    id: string;
    path: string;
    size: number;
    createdAt: string;
    url: string;
  };
};

type UploadEmailAttachmentFileVariables = {
  file: File;
};

export const useUploadEmailAttachment = () => {
  const [uploadEmailAttachmentFileMutation] = useMutation<
    UploadEmailAttachmentFileResponse,
    UploadEmailAttachmentFileVariables
  >(UPLOAD_EMAIL_ATTACHMENT_FILE);
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { t } = useLingui();

  // We reuse `WorkflowAttachment` as the in-memory shape because the SendEmail
  // mutation input mirrors it field-for-field — sharing the type keeps the
  // composer wiring trivial. The persisted file lives under the
  // `email-attachment` folder, not the workflow folder.
  const uploadEmailAttachment = async (
    file: File,
  ): Promise<WorkflowAttachment | null> => {
    try {
      if (file.size > MAX_ATTACHMENT_SIZE) {
        const fileName = file.name;
        const maxUploadSize = formatFileSize(MAX_ATTACHMENT_SIZE);

        enqueueErrorSnackBar({
          message: t`File "${fileName}" exceeds ${maxUploadSize}`,
        });

        return null;
      }

      const result = await uploadEmailAttachmentFileMutation({
        variables: { file },
      });

      const uploadedFile = result?.data?.uploadEmailAttachmentFile;

      if (!isDefined(uploadedFile)) {
        throw new Error('File upload failed');
      }

      const attachment: WorkflowAttachment = {
        id: uploadedFile.id,
        name: file.name,
        size: uploadedFile.size,
        type: extractFolderPathFilenameAndTypeOrThrow(uploadedFile.path).type,
        createdAt: uploadedFile.createdAt,
      };

      const fileName = file.name;

      enqueueSuccessSnackBar({
        message: t`File "${fileName}" uploaded successfully`,
      });

      return attachment;
    } catch (error) {
      logError(`Failed to upload email attachment "${file.name}": ${error}`);

      const fileNameForError = file.name;

      enqueueErrorSnackBar({
        message: t`Failed to upload "${fileNameForError}"`,
      });

      return null;
    }
  };

  return { uploadEmailAttachment };
};
