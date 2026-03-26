"use client";

import { useEffect, useState } from "react";
import { api, ENDPOINT } from "@/lib/api.client";
import { Upload, Trash2, Video, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      const response = await api.get(ENDPOINT.adminVideos);
      setVideos(response.data.data);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        alert("Please select a video file");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("video", selectedFile);

    try {
      await api.post(ENDPOINT.adminVideoUploadLocal, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Video uploaded successfully!");
      setSelectedFile(null);
      fetchVideos();
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, key, source) => {
    if (!confirm("Are you sure you want to delete this video?")) return;

    try {
      const params = new URLSearchParams();
      if (key) params.append("key", key);
      if (source) params.append("source", source);

      await api.delete(`${ENDPOINT.adminVideoDelete(id)}?${params.toString()}`);
      alert("Video deleted successfully!");
      fetchVideos();
    } catch (error) {
      console.error("Error deleting video:", error);
      alert("Failed to delete video");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-[#c1a362]" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Video Management</h2>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg p-6 border border-gray-800 mb-6">
        <h3 className="text-lg font-semibold mb-4">Upload New Video</h3>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#c1a362] file:text-black hover:file:bg-[#b89351]"
          />
          {selectedFile && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">{selectedFile.name}</span>
              <Button
                onClick={handleUpload}
                disabled={uploading}
                className="bg-[#c1a362] text-black hover:bg-[#b89351]"
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[#1a1a1a] rounded-lg border border-gray-800">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold">All Videos ({videos.length})</h3>
        </div>
        <div className="divide-y divide-gray-800">
          {videos.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos found. Upload your first video above.</p>
            </div>
          ) : (
            videos.map((video) => (
              <div
                key={video.id}
                className="p-4 flex items-center justify-between hover:bg-[#252525] transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-10 bg-[#252525] rounded flex items-center justify-center">
                    <Video className="h-6 w-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="font-medium">{video.name}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <span>Source: {video.source || "local"}</span>
                      {video.key && (
                        <span className="text-xs bg-[#c1a362]/20 text-[#c1a362] px-2 py-0.5 rounded">
                          S3
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(video.id, video.key, video.source)}
                  className="bg-red-900/50 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
