const translation = {
    Title: "Notebook",
    Theme: {
        Title: "Theme",
    },
    validateForm: {
        emailNoNone: "Please enter email",
        emailValid: "Please enter a valid email",
        nameNoNone: "Please enter name",
        passwordNoNone: "Please enter password",
        passwordValid: "Please enter a password with 8 or more characters",
        email: "Email",
        name: "Name",
        password: "Password",
        submit: "Submit",
        reset: "Reset"
    },
    account: {
        logout: "Logout",
        setting: "Setting",
        language: "Language",
        theme: "Theme"
    },
    studyPlan: {
        progress: "Progress: {{progress}}%",
        total: "Total: {{total}} days",
        completed: "Completed: {{completed}} goals",
        remaining: "Remaining: {{remaining}} goals",
        today: "Today",
        studyTask: "Study Task",
        taskProcess: "Task Process",
        task: "Total {{total}} tasks"
    },
    fileUploader: {
        uploadFromComputerLimit: "File size exceeds limit ({{size}})",
        uploadFromComputerUploadError: "File upload failed",
        uploadFromComputerReadError: "File read failed",
        fileExtensionNotSupport: "Unsupported file type",
        pasteFileLinkInvalid: "Invalid file link"
    },
    fileOperations: {
        createFile: "New File",
        createFolder: "New Folder",
        rename: "Rename",
        delete: "Delete",
        inputFileName: "Please enter file name:",
        inputFolderName: "Please enter folder name:",
        inputNewFileName: "Please enter new file name:",
        inputNewFolderName: "Please enter new folder name:",
        confirmDeleteFile: "Are you sure you want to delete file \"{{fileName}}\"?",
        confirmDeleteFolder: "Are you sure you want to delete folder \"{{folderName}}\" and all its contents?"
    },
    settings: {
        title: "Settings",
        userSettings: "User Settings",
        languageSettings: "Language Settings",
        taskSettings: "Task Settings",
        oldPassword: "Old Password",
        newPassword: "New Password",
        confirmPassword: "Confirm Password",
        name: "Name",
        email: "Email",
        editPassword: "Edit Password",
        editUser: "Edit User",
        editTask: "Edit Task",
        // 新增的翻译键
        description: "Manage your account settings and application preferences",
        userProfile: "Personal Profile",
        userProfileDesc: "Update your name, avatar and personal information",
        accountSecurity: "Account Security",
        accountSecurityDesc: "Password, two-factor authentication and login activity",
        interfaceLanguage: "Interface Language",
        interfaceLanguageDesc: "Choose the display language for the application",
        languageRegionDesc: "Interface language and region settings",
        workflowDesc: "Workflow and task management preferences",
        taskListManagement: "Task List Management",
        taskListManagementDesc: "Set up and manage your daily tasks (up to 6)",
        editTaskButton: "Edit Tasks",
        editButton: "Edit",
        manageButton: "Manage"
    },
    common: {
        loading: "Loading...",
        loadingFileTree: "Loading file tree...",
        verifyingAuth: "Verifying authentication...",
        upload: "Upload",
        send: "Send",
        uploadFile: "Upload File",
        noContentCannotSend: "No content to send",
        placeholder: "Please enter your question",
        retry: "Retry Upload",
        uploading: "Uploading {{progress}}%",
        uploadComplete: "Upload Complete",
        uploadFailed: "Upload Failed",
        waitingUpload: "Waiting to Upload",
        noArrangement: "No arrangement",
        inputSearchQuestion: "Please enter search question"
    },
    notifications: {
        refreshFileTreeFailed: "Failed to refresh file tree",
        folderCreated: "Folder created successfully",
        createFolderFailed: "Failed to create folder",
        fileCreated: "File created successfully",
        createFileFailed: "Failed to create file",
        deleteSuccess: "{{name}} deleted successfully",
        deleteFailed: "Failed to delete",
        renameSuccess: "{{name}} renamed successfully",
        renameFailed: "Failed to rename"
    },
    layout: {
        authenticating: "Verifying authentication..."
    },
    llm: {
        aiAssistant: "AI Assistant",
        startConversation: "Start chatting with AI assistant!",
        clearConversation: "Clear conversation",
        inputPlaceholder: "Please enter your message, supports file upload and voice input..."
    },
    themes: {
        defaultBlue: "Default Blue",
        vibrantOrange: "Vibrant Orange",
        freshGreen: "Fresh Green",
        elegantPurple: "Elegant Purple",
        warmRed: "Warm Red",
        deepBlue: "Deep Blue"
    },
    editor: {
        tip: 'Please select a file to edit',
    }
}
export default translation;