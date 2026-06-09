import { ClassicEditor, Essentials, Paragraph, Image, ImageUpload } from 'ckeditor5';

import { cxmService } from "@/services/CxmService";
class CkUploadAdapter {
    customParam;  
    apiUrl;
    constructor( loader, customParam, apiUrl ) {
        // The file loader instance to use during the upload.
        this.loader = loader;
        this.customParam = customParam;
        this.apiUrl = apiUrl;
    }

    // Starts the upload process.
    upload() {
        return this.loader.file
            .then( file => new Promise( ( resolve, reject ) => {
                // this._initRequest();
                // this._initListeners( resolve, reject, file );
                // this._sendRequest( file );
                const data = new FormData();
                data.append( 'files', file );
                cxmService.Message.Post.uploadAttachmentFile(this.customParam?.itemId,data).subscribe({
                  next: response => {
                    if (response && response.length > 0) {
                      resolve({
                        default: `${this.apiUrl}/Document/downloadFile/${response[0].drawingId}?companyId=${this.customParam?.company?.id}`
                      });
                    } else {
                      resolve({
                        default: response
                      });
                    }
                  },
                  error: () => {
                    resolve({
                      default: 'Lỗi upload file'
                    });
                  }
                });
            }));
    }
}

export default CkUploadAdapter;
