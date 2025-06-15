// demo3-fileupload.js
function uploadFile(req, res) {
    const file = req.file;
    const fileName = file.originalname; // No filename sanitization!
    const filePath = './uploads/' + fileName; // Path traversal vulnerability!
    
    // No file type validation!
    fs.writeFileSync(filePath, file.buffer);
    
    const fileRecord = {
        originalName: fileName,
        filePath: filePath,
        size: file.size,
        uploadedBy: req.user.id,
        uploadedAt: new Date()
    };
    
    const savedFile = database.files.create(fileRecord);
    
    res.json({
        message: 'File uploaded successfully',
        fileId: savedFile.id,
        downloadUrl: '/download/' + savedFile.id // Direct file access!
    });
}

function downloadFile(fileId, userId) {
    const file = database.files.findById(fileId);
    
    // Weak authorization check
    if (file.uploadedBy !== userId) {
        throw new Error('Unauthorized access');
    }
    
    // No path validation - directory traversal risk!
    const fileContent = fs.readFileSync(file.filePath);
    
    return {
        content: fileContent,
        filename: file.originalName,
        contentType: getContentType(file.originalName)
    };
}