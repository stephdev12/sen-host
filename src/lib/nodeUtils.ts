import { prisma } from '@/lib/prisma';
import { Bot, Node } from '@prisma/client';

export async function getAvailableNode(): Promise<Node | null> {
  // Simple strategy: First enabled node.
  // Advanced: Check load (API call to node to check CPU/RAM) or count bots in DB.
  
  // Let's pick the node with the fewest bots
  const nodes = await prisma.node.findMany({
    where: { enabled: true },
    include: { _count: { select: { bots: true } } }
  });

  if (nodes.length === 0) return null;

  // Sort by bot count
  nodes.sort((a, b) => a._count.bots - b._count.bots);

  return nodes[0];
}

export async function callNodeApi(node: Node, endpoint: string, method: string = 'GET', body?: any) {
  try {
    const url = `${node.url.replace(/\/$/, '')}${endpoint}`; // Ensure no double slash
    const headers: any = {
      'Content-Type': 'application/json',
      'x-api-key': node.apiKey
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`Node API Error: ${res.status} ${text}`);
    }

    // Handle text responses (like logs) vs JSON
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return await res.json();
    }
    return await res.text();

  } catch (error) {
    console.error(`Error calling node ${node.name} (${node.url}):`, error);
    throw error;
  }
}
