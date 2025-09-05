const translation = {
    Title: "笔记本",
    Theme: {
        Title: "主题",
    },
    validateForm: {
        emailNoNone: "请输入邮箱",
        emailValid: "请输入正确的邮箱",
        nameNoNone: "请输入姓名",
        passwordNoNone: "请输入密码",
        passwordValid: "请输入8位以上的密码",
        email: "邮箱",
        name: "姓名",
        password: "密码",
        submit: "提交",
        reset: "重置"
    },
    account: {
        logout: "登出",
        setting: "设置",
        language: "语言切换",
        theme: "主题切换"
    },
    studyPlan: {
        progress: "当前进度: {{progress}}%",
        total: "总天数: {{total}} 天",
        completed: "已完成 {{completed}} 项目标",
        remaining: "剩余 {{remaining}} 项目标",
        today: "今",
        studyTask: "学习任务",
        taskProcess: "任务进度",
        task: "今日共 {{total}} 个任务",
        addTask: "添加任务"
    },
    fileUploader: {
        uploadFromComputerLimit: "文件大小超过限制 ({{size}})",
        uploadFromComputerUploadError: "文件上传失败",
        uploadFromComputerReadError: "文件读取失败",
        fileExtensionNotSupport: "不支持的文件类型",
        pasteFileLinkInvalid: "无效的文件链接"
    },
    fileOperations: {
        createFile: "新建文件",
        createFolder: "新建文件夹",
        rename: "重命名",
        delete: "删除",
        inputFileName: "请输入文件名:",
        inputFolderName: "请输入文件夹名:",
        inputNewFileName: "请输入新的文件名:",
        inputNewFolderName: "请输入新的文件夹名:",
        confirmDeleteFile: "确定要删除文件 \"{{fileName}}\" 吗？",
        confirmDeleteFolder: "确定要删除文件夹 \"{{folderName}}\" 及其所有内容吗？"
    },
    settings: {
        title: "设置",
        userSettings: "用户设置",
        languageSettings: "语言设置",
        taskSettings: "任务设置",
        oldPassword: "旧密码",
        newPassword: "新密码",
        confirmPassword: "确认密码",
        name: "姓名",
        email: "邮箱",
        editPassword: "编辑密码",
        editUser: "编辑用户",
        editTask: "编辑任务",
        // 新增的翻译键
        description: "管理您的账户设置和应用偏好",
        userProfile: "个人资料",
        userProfileDesc: "更新您的姓名、头像和个人信息",
        accountSecurity: "账户安全",
        accountSecurityDesc: "密码、两步验证和登录活动",
        interfaceLanguage: "界面语言",
        interfaceLanguageDesc: "选择应用程序的显示语言",
        languageRegionDesc: "界面语言和地区设置",
        workflowDesc: "工作流程和任务管理偏好",
        taskListManagement: "任务列表管理",
        taskListManagementDesc: "设置和管理您的日常任务（最多 6 个）",
        editTaskButton: "编辑任务",
        editButton: "编辑",
        manageButton: "管理"
    },
    common: {
        loading: "正在加载...",
        loadingFileTree: "正在加载文件树...",
        verifyingAuth: "验证身份中...",
        upload: "上传",
        send: "发送",
        uploadFile: "上传文件",
        noContentCannotSend: "无内容无法发送",
        placeholder: "请输入搜索问题",
        inputSearchQuestion: "请输入搜索问题",
        retry: "重新上传",
        uploading: "上传中 {{progress}}%",
        uploadComplete: "上传完成",
        uploadFailed: "上传失败",
        waitingUpload: "等待上传",
        noArrangement: "暂无安排"
    },
    notifications: {
        refreshFileTreeFailed: "刷新文件树失败",
        folderCreated: "文件夹创建成功",
        createFolderFailed: "创建文件夹失败",
        fileCreated: "文件创建成功",
        createFileFailed: "创建文件失败",
        deleteSuccess: "{{name}}删除成功",
        deleteFailed: "删除失败",
        renameSuccess: "{{name}}重命名成功",
        renameFailed: "重命名失败"
    },
    layout: {
        authenticating: '验证身份中...'
    },
    llm: {
        aiAssistant: 'AI 助手',
        startConversation: '开始与AI助手对话吧！',
        clearConversation: '清空对话',
        inputPlaceholder: '请输入您的消息，支持文件上传和语音输入...'
    },
    themes: {
        defaultBlue: '默认蓝',
        vibrantOrange: '活力橙',
        freshGreen: '清新绿',
        elegantPurple: '优雅紫',
        deepDark: '深邃黑',
    },
    editor: {
        tip: '请选择一个文件进行编辑',
    }
}
export default translation;