import { Injectable, signal, inject } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import type { Photo } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Platform } from '@ionic/angular';
import { Capacitor } from '@capacitor/core';

@Injectable({
    providedIn: 'root'
})

export class PhotoService {
    public photos = signal<UserPhoto[]>([]);
    private PHOTO_STORAGE: string = 'photos';
    private platform = inject(Platform);

    public async addNewToGallery() {
        //toma de foto
        const capturedPhoto = await Camera.getPhoto({
            resultType: CameraResultType.Uri,
            source: CameraSource.Camera,
            quality: 100
        });

        const savedImageFile = await this.savePicture(capturedPhoto);
        this.photos.update((photos) => [savedImageFile, ...photos]);

        //meotodo para revelar la foto
        Preferences.set({
            key: this.PHOTO_STORAGE,
            value: JSON.stringify(this.photos())
        });
    }

    public async savePicture(photo: Photo) {
        let base64Data: string | Blob;

        if (this.platform.is('hybrid')) {
            const file = await Filesystem.readFile({
                path: photo.path!
            });
            base64Data = file.data;
        } else {
            base64Data = await this.base64FromPath(photo.webPath!);
        }

        const fileName = Date.now() + '.jpeg';
        const savedFile = await Filesystem.writeFile({
            path: fileName,
            data: base64Data,
            directory: Directory.Data
        });

        if (this.platform.is('hybrid')) {
            return {
                filepath: savedFile.uri,
                webviewPath: Capacitor.convertFileSrc(savedFile.uri)
            };
        } else {
            return {
                filepath: fileName,
                webviewPath: photo.webPath,
            };
        }


    }

    private async base64FromPath(path: string): Promise<string> {

        const response = await fetch(path);
        const blob = await response.blob();

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onload = () => {
                if (typeof reader.result === 'string') {
                    resolve(reader.result);
                } else {
                    reject('meotodo no devolvió un string')
                }
            };
            reader.readAsDataURL(blob);
        });
    }

    public async loadSaved() {
        const { value: photoList } = await Preferences.get({ key: this.PHOTO_STORAGE });
        const photos = (photoList ? JSON.parse(photoList) : []) as UserPhoto[];

        if (!this.platform.is('hybrid')) {
            for (const photo of photos) {
                const file = await Filesystem.readFile({
                    path: photo.filepath,
                    directory: Directory.Data
                });

                photo.webviewPath = `data:image/jpeg;base64,${file.data}`;
            }
        }

        this.photos.set(photos);
    }

    public async deletePhoto(photo: UserPhoto, position: number) {
        this.photos.update((photos) => photos.filter((_, index) => index !== position));

        Preferences.set({
            key: this.PHOTO_STORAGE,
            value: JSON.stringify(this.photos()),
        });

        const filename = photo.filepath.slice(photo.filepath.lastIndexOf('/') + 1);

        await Filesystem.deleteFile({
            path: filename,
            directory: Directory.Data,
        });
    }
}

export interface UserPhoto {
    filepath: string;
    webviewPath?: string;
}
