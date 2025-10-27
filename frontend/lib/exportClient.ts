const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface ExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'text';
  response: string;
  chatId?: string;
  model?: string;
  prompt?: string;
  fileName?: string;
}

export interface BatchExportOptions {
  format: 'pdf' | 'markdown' | 'json' | 'text';
  chatId: string;
  fileName?: string;
}

/**
 * Export a single AI response
 */
export async function exportResponse(token: string, options: ExportOptions): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Export failed');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = options.fileName || 'export';
    
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
}

/**
 * Export entire chat conversation
 */
export async function exportChat(token: string, options: BatchExportOptions): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/export-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error('Batch export failed');
    }

    // Get filename from Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = options.fileName || 'chat_export';
    
    if (contentDisposition) {
      const matches = /filename="([^"]+)"/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1];
      }
    }

    // Create blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    
    // Cleanup
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Batch export error:', error);
    throw error;
  }
}

/**
 * Get export history
 */
export async function getExportHistory(token: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat/exports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch export history');
    }

    return await response.json();
  } catch (error) {
    console.error('Export history error:', error);
    throw error;
  }
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        document.body.removeChild(textArea);
        return true;
      } catch (err) {
        document.body.removeChild(textArea);
        return false;
      }
    }
  } catch (error) {
    console.error('Copy to clipboard failed:', error);
    return false;
  }
}
