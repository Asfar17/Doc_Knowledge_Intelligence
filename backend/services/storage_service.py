import os
import uuid
from typing import Optional
from pathlib import Path
from config.settings import settings
from azure.storage.blob import BlobServiceClient


class StorageService:
    def __init__(self):
        self.storage_type = settings.STORAGE_TYPE
        self.local_storage_path = Path(settings.LOCAL_STORAGE_PATH)
        self.azure_connection_string = settings.AZURE_STORAGE_CONNECTION_STRING
        self.azure_container_name = settings.AZURE_STORAGE_CONTAINER_NAME

        if self.storage_type == "local":
            self.local_storage_path.mkdir(parents=True, exist_ok=True)
        elif self.storage_type == "azure":
            self.blob_service_client = BlobServiceClient.from_connection_string(
                self.azure_connection_string
            )
            self.container_client = self.blob_service_client.get_container_client(
                self.azure_container_name
            )
            if not self.container_client.exists():
                self.container_client.create_container()

    def save_file(self, file_content: bytes, filename: str) -> str:
        unique_filename = f"{uuid.uuid4()}_{filename}"
        if self.storage_type == "azure" and self.azure_connection_string:
            blob_client = self.container_client.get_blob_client(unique_filename)
            blob_client.upload_blob(file_content)
            return blob_client.url
        else:
            file_path = self.local_storage_path / unique_filename
            with open(file_path, "wb") as f:
                f.write(file_content)
            return str(file_path.resolve())

    def get_file(self, file_path: str) -> Optional[bytes]:
        if self.storage_type == "azure" and self.azure_connection_string:
            try:
                blob_name = file_path.split("/")[-1]
                blob_client = self.container_client.get_blob_client(blob_name)
                return blob_client.download_blob().readall()
            except Exception:
                return None
        else:
            try:
                with open(file_path, "rb") as f:
                    return f.read()
            except Exception:
                return None

    def delete_file(self, file_path: str) -> bool:
        if self.storage_type == "azure" and self.azure_connection_string:
            try:
                blob_name = file_path.split("/")[-1]
                self.container_client.delete_blob(blob_name)
                return True
            except Exception:
                return False
        else:
            try:
                os.remove(file_path)
                return True
            except Exception:
                return False


storage_service = StorageService()
