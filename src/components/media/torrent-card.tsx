import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Magnet, Server, Upload } from 'lucide-react';

interface Torrent {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
}

interface TorrentCardProps {
  torrent: Torrent;
}

export function TorrentCard({ torrent }: TorrentCardProps) {
  const handleDownload = () => {
    window.open(torrent.url, '_blank');
  };

  const handleMagnet = () => {
    navigator.clipboard.writeText(`magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(torrent.url)}`);
    // You might want to show a toast notification here to indicate the magnet link has been copied.
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{torrent.quality}</span>
          <Badge variant={torrent.type === 'web' ? 'secondary' : 'default'}>
            {torrent.type}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Upload className="h-4 w-4 text-green-500" />
            <span>{torrent.seeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-red-500" />
            <span>{torrent.peers}</span>
          </div>
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            <span>{torrent.size}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleDownload} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleMagnet} variant="outline" className="w-full">
            <Magnet className="h-4 w-4 mr-2" />
            Magnet
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
