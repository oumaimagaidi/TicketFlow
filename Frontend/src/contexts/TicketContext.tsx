import React, { createContext, useContext, useState, useEffect } from 'react';
import { Ticket, TicketCategory, TicketStatus } from '@/types/ticket';
import { useAuth } from './AuthContext';

interface TicketContextType {
  tickets: Ticket[];
  loading: boolean;
  createTicket: (ticketData: FormData) => Promise<{ success: boolean; error?: string }>;
  updateTicketStatus: (ticketId: number, newStatus: TicketStatus) => Promise<{ success: boolean; error?: string }>;
  fetchTickets: () => Promise<void>;
  getTicketById: (id: number) => Ticket | undefined;
  getUserTickets: () => Ticket[];
}

const TicketContext = createContext<TicketContextType | undefined>(undefined);

export function TicketProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const API_URL = 'http://localhost:8000/api/auth';

  
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');

      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/tickets/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Fetch tickets response:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('Tickets data received (RAW):', data);

        const formattedTickets: Ticket[] = data.map((ticket: any) => {
          console.log('Processing ticket:', ticket);

          let createdById = '';
          let createdByName = 'Unknown';
          let attachmentUrl = ticket.attachment || ticket.attachment_url;
          let attachmentDownloadUrl = ticket.attachment_download_url;

          const fixCloudinaryUrl = (url: string | undefined): string | undefined => {
            if (!url) return undefined;

            if (url.startsWith('http')) return url;

            if (url.startsWith('/image/upload/') || url.startsWith('/video/upload/') || url.startsWith('/raw/upload/')) {
              return `https://res.cloudinary.com/drbbqusyr${url}`;
            }

            if (url.startsWith('/')) {
              return `http://localhost:8000${url}`;
            }

            return url;
          };

          if (attachmentUrl) {
            attachmentUrl = fixCloudinaryUrl(attachmentUrl);
          }

          if (attachmentDownloadUrl) {
            attachmentDownloadUrl = fixCloudinaryUrl(attachmentDownloadUrl);
          } else if (attachmentUrl) {
            attachmentDownloadUrl = attachmentUrl.replace('/upload/', '/upload/fl_attachment/');
          }

          if (ticket.created_by) {
            if (typeof ticket.created_by === 'object') {
              createdById = ticket.created_by.id?.toString() || '';
              createdByName = ticket.created_by.username || ticket.created_by.name || 'Unknown';
            } else if (typeof ticket.created_by === 'string') {
              createdByName = ticket.created_by;
            }
          }

          console.log(`Ticket ${ticket.id}: createdById=${createdById}, createdByName=${createdByName}`);
          console.log(`Attachment URL: ${attachmentUrl}`);
          console.log(`Download URL: ${attachmentDownloadUrl}`);

          return {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            category: ticket.category,
            status: ticket.status,
            priority: ticket.priority || 'Medium',
            attachment: attachmentUrl,
            attachmentName: ticket.attachment_name || '',
            attachment_url: attachmentUrl,
            attachment_download_url: attachmentDownloadUrl, 
            createdBy: createdById || createdByName,
            createdByName: createdByName,
            createdAt: ticket.created_at || new Date().toISOString(),
            statusHistory: [
              {
                status: ticket.status,
                changedAt: ticket.created_at || new Date().toISOString(),
                changedBy: createdByName || 'System'
              }
            ]
          };
        });

        console.log('Formatted tickets:', formattedTickets);
        setTickets(formattedTickets);
      } else {
        const errorText = await response.text();
        console.error('Failed to fetch tickets:', errorText);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createTicket = async (formData: FormData): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('access_token');

      console.log('Creating ticket with data:', {
        title: formData.get('title'),
        category: formData.get('category')
      });

      const response = await fetch(`${API_URL}/tickets/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('Create ticket response:', response.status);

      if (response.ok) {
        const newTicket = await response.json();
        console.log('New ticket created:', newTicket);

        const formattedTicket: Ticket = {
          id: newTicket.id,
          title: newTicket.title,
          description: newTicket.description,
          category: newTicket.category,
          status: newTicket.status,
          priority: newTicket.priority || 'Medium',
          attachment: newTicket.attachment || newTicket.attachment_url,
          attachmentName: newTicket.attachment_name || '',
          attachment_url: newTicket.attachment || newTicket.attachment_url,
          createdBy: (newTicket.created_by?.id || user?.id || '').toString(),
          createdByName: newTicket.created_by?.username || user?.name || 'Unknown',
          createdAt: newTicket.created_at || new Date().toISOString(),
          statusHistory: [
            {
              status: newTicket.status,
              changedAt: newTicket.created_at || new Date().toISOString(),
              changedBy: newTicket.created_by?.username || user?.name || 'System'
            }
          ]
        };

        setTickets(prev => [formattedTicket, ...prev]);
        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('Create ticket error:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('Create ticket error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const updateTicketStatus = async (ticketId: number, newStatus: TicketStatus): Promise<{ success: boolean; error?: string }> => {
    try {
      const token = localStorage.getItem('access_token');

      const payload = { status: newStatus };

      console.log('🔄 Updating ticket status:', { ticketId, newStatus, payload });

      const response = await fetch(`${API_URL}/tickets/${ticketId}/update_status/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload) 
      });

      console.log('📥 Update status response:', response.status, response.statusText);

      if (response.ok) {
        const updatedTicket = await response.json();
        console.log('✅ Ticket updated:', updatedTicket);

        setTickets(prev => prev.map(ticket => {
          if (ticket.id === ticketId) {
            return {
              ...ticket,
              status: updatedTicket.status,
              statusHistory: [
                ...ticket.statusHistory,
                {
                  status: updatedTicket.status,
                  changedAt: new Date().toISOString(),
                  changedBy: user?.name || 'Admin'
                }
              ]
            };
          }
          return ticket;
        }));

        return { success: true };
      } else {
        const errorText = await response.text();
        console.error('❌ Update ticket error:', errorText);
        return { success: false, error: errorText };
      }
    } catch (error) {
      console.error('💥 Update ticket error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  const getTicketById = (id: number) => {
    return tickets.find(t => t.id === id);
  };

  
  const getUserTickets = () => {
    console.log('=== getUserTickets called ===');
    console.log('isAdmin:', isAdmin);
    console.log('User:', user);
    console.log('All tickets count:', tickets.length);

    if (!user) {
      console.log('No user, returning empty array');
      return [];
    }

    if (isAdmin) {
      console.log('Admin mode: returning all tickets');
      return tickets;
    }

    const userIdStr = user.id?.toString();
    const userName = user.name;

    console.log('Looking for tickets with:');
    console.log('  - User ID:', userIdStr);
    console.log('  - User Name:', userName);

    const filteredTickets = tickets.filter(t => {
      const ticketCreatedBy = t.createdBy?.toString();
      const ticketCreatedByName = t.createdByName?.toLowerCase();
      const currentUserName = userName?.toLowerCase();

      console.log(`Ticket ${t.id}:`);
      console.log(`  - createdBy="${ticketCreatedBy}"`);
      console.log(`  - createdByName="${ticketCreatedByName}"`);
      console.log(`  - userID="${userIdStr}"`);
      console.log(`  - userName="${currentUserName}"`);

      const matchesById = ticketCreatedBy === userIdStr;
      const matchesByName = ticketCreatedByName === currentUserName;

      console.log(`  - matchesById=${matchesById}, matchesByName=${matchesByName}`);

      return matchesById || matchesByName;
    });

    console.log('Filtered tickets count:', filteredTickets.length);
    return filteredTickets;
  };

  useEffect(() => {
    if (user) {
      console.log('User logged in, fetching tickets...');
      fetchTickets();
    } else {
      console.log('No user, clearing tickets');
      setTickets([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <TicketContext.Provider value={{
      tickets,
      loading,
      createTicket,
      updateTicketStatus,
      fetchTickets,
      getTicketById,
      getUserTickets
    }}>
      {children}
    </TicketContext.Provider>
  );
}

export function useTickets() {
  const context = useContext(TicketContext);
  if (context === undefined) {
    throw new Error('useTickets must be used within a TicketProvider');
  }
  return context;
}