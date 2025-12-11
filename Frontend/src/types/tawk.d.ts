
interface TawkToAPI {
    setAttributes: (attributes: Record<string, any>, callback?: (error: any) => void) => void;
    maximize: () => void;
    minimize: () => void;
    toggle: () => void;
    showWidget: () => void;
    hideWidget: () => void;
    getStatus: () => string;
    onLoad: () => void;
    onStatusChange?: (status: string) => void;
    onChatMaximized?: () => void;
    onChatMinimized?: () => void;
    onChatHidden?: () => void;
    onChatStarted?: () => void;
    onChatEnded?: () => void;
    onPrechatSubmit?: () => void;
    onOfflineSubmit?: () => void;
    logout?: () => void;
}

declare global {
    interface Window {
        Tawk_API?: TawkToAPI;
        Tawk_LoadStart?: Date;
    }
}

export { }; 