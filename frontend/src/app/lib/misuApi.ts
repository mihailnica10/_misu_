/**
 * Compatibility layer — re-exports from mikeApi.
 * Previously contained the full API client; now just re-exports for
 * files that still reference @/app/lib/misuApi.
 */
export type { Document, DocumentVersion, CaseLawOpinion } from "./mikeApi";

export {
    getCourtlistenerOpinions,
    listDocumentVersions,
    uploadDocumentVersion,
    renameDocumentVersion,
    getProject,
    listProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectPeople,
    getChat,
    listChats,
    listProjectChats,
    createChat,
    streamChat,
    streamProjectChat,
    generateChatTitle,
    listStandaloneDocuments,
    uploadStandaloneDocument,
    getDocumentUrl,
    uploadProjectDocument,
    downloadDocumentsZip,
    createProjectFolder,
    renameProjectFolder,
    deleteProjectFolder,
    listTabularReviews,
    createTabularReview,
    getTabularReview,
    updateTabularReview,
    deleteTabularReview,
    streamTabularGeneration,
    streamTabularChat,
    generateTabularColumnPrompt,
    getTabularChats,
    getTabularChatMessages,
    deleteTabularChat,
    listWorkflows,
    getWorkflow,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
} from "./mikeApi";

// ---------------------------------------------------------------------------
// Helpers that were previously here
// ---------------------------------------------------------------------------

export function fileTypeForVersion(
    version: { file_type?: string | null; filename?: string | null },
    docFileType?: string | null,
): string {
    return version.file_type ?? docFileType ?? "pdf";
}

export const DataRow = ({
    label,
    value,
}: {
    label: string;
    value: string | null | undefined;
}) =>
    value
        ? {
              label,
              value,
          }
        : null;

export function filenameExtension(filename: string): string | null {
    const dot = filename.lastIndexOf(".");
    return dot >= 0 ? filename.slice(dot).toLowerCase() : null;
}

export function hasExtensionChange(
    currentName: string,
    newName: string,
): boolean {
    const current = filenameExtension(currentName);
    const next = filenameExtension(newName);
    return !!current && !!next && current !== next;
}
