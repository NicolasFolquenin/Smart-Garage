import apiClient from "../http-common";

class BackupDataService {
    getStatus() {
        return apiClient.get("/api/backup/status");
    }

    listar() {
        return apiClient.get("/api/backup");
    }

    criar() {
        return apiClient.post("/api/backup");
    }

    async download(filename) {
        const response = await apiClient.get(`/api/backup/download/${filename}`, {
            responseType: 'blob'
        });
        
        // Dispara o download no navegador
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
    }

    excluir(filename) {
        return apiClient.delete(`/api/backup/${filename}`);
    }

    restaurar(filename) {
        return apiClient.post(`/api/backup/restaurar/${filename}`);
    }

    uploadERestaurar(file) {
        const formData = new FormData();
        formData.append("backupFile", file);

        return apiClient.post("/api/backup/upload-restaurar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    }
}

export default new BackupDataService();
