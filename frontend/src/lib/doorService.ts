// Door service for generating door access links
export interface GenerateOpenLinkResponse {
    success: boolean;
    data?: {
        accessPath: string;
        token: string;
        bookingRef: string;
        enable_at: string;
        expiresAt: string;
        maxAccessCount: number | null;
        currentAccessCount: number;
        unlimitedAccess: boolean;
    };
    message?: string;
}
// API Base URL
const API_BASE = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'https://productive-space-backend.vercel.app/api'
/**
 * Generate a secure access link to open the door
 * @param bookingRef - The booking reference
 * @returns Promise with access link data
 */
export async function generateOpenLink(bookingRef: string): Promise<GenerateOpenLinkResponse> {
    try {
        const response = await fetch(`${API_BASE}/door/generate-open-link`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ bookingRef }),
        });
        return handleResponse(response);
    } catch (error) {
        // If fetch threw, there is no Response object to pass
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Helper function to handle API responses
const handleResponse = async (response: Response): Promise<GenerateOpenLinkResponse> => {
    try {
        const responseData = await response.json();
        if (!response.ok) {
            return {
                success: false,
                message: responseData.message || responseData.error || `HTTP ${response.status}`,
            };
        }
        return {
            success: true,
            data: {
                ...responseData.data,
                accessPath: `${API_BASE}${responseData.data.accessPath}`,
            },
            message: responseData.message,
        };
    } catch (error) {   
        return {
            success: false,
            message: 'Failed to parse response',
        };
    }
}
