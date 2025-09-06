import React, { useState } from 'react'
import { z } from "zod"
import { useTranslation } from "react-i18next";
import Button from "@/components/base/Button"
import Input from "@/components/base/Input"

type iProps = {
    onSubmit: (data: any) => void;
}
const AccountForm = ({onSubmit}: iProps) => {
    const { t } = useTranslation();
    const validPassword = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    const AccountSchema = z.object({
        email: z.string().min(1, t('common.validateForm.emailNoNone')).email(t('common.validateForm.emailValid')),
        name: z.string().min(1, t('common.validateForm.nameNoNone')),
        password: z.string().min(1, t('common.validateForm.passwordNoNone')).regex(validPassword, t('common.validateForm.passwordValid')),
    })

    type AccountFormType = z.infer<typeof AccountSchema>
    type AccountFormErrors = Partial<Record<keyof AccountFormType, string>>
    const [formState, setFormState] = useState<AccountFormType>({
        email: '',
        name: '',
        password: '',
    })
    const [formErrors, setFormErrors] = useState<AccountFormErrors>({})

    const validateForm = (name: keyof AccountFormType, value: string) => {
        const fieldSchema = AccountSchema.shape[name];
        const result = fieldSchema.safeParse(value);
        
        if (result.success) {
            setFormErrors(prev => ({...prev, [name]: undefined}))
            return true
        } else {
            setFormErrors(prev => ({...prev, [name]: result.error.issues[0].message}))
            return false
        }
    }
    const handleChange = (name: keyof AccountFormType, value: string) => {
        validateForm(name, value);
        setFormState({...formState, [name]: value})
    }
    const handleReset = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setFormState({
            email: '',
            name: '',
            password: '',
        })
    }
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // 检查所有字段并收集错误信息
        const newErrors: AccountFormErrors = {};
        let isValid = true;
        
        // 遍历所有表单字段进行验证
        Object.keys(formState).forEach(key => {
            const fieldName = key as keyof AccountFormType;
            const fieldValue = formState[fieldName];
            const fieldSchema = AccountSchema.shape[fieldName];
            const result = fieldSchema.safeParse(fieldValue);
            
            if (!result.success) {
                newErrors[fieldName] = result.error.issues[0].message;
                isValid = false;
            }
        });
        
        // 更新错误状态
        setFormErrors(newErrors);
        
        // 如果所有字段都有效，则提交表单
        if (isValid) {
            onSubmit(formState);
        }
    }

    return (
        <div className='flex flex-col w-1/3 rounded bg-primary'>
            <form onSubmit={handleSubmit}>
                <div className='flex flex-col mb-md'>
                    <div className="flex items-center w-full">
                        <label className="w-24 text-right mr-2">{t('common.validateForm.name')}</label>
                        <Input 
                            
                            destructive={ formErrors.name ? true : false}
                            type="text"
                            autoComplete="name"
                            value={formState.name} 
                            onChange={(e) => handleChange('name', e.target.value)} 
                        />
                    </div>
                    {
                        formErrors.name && <div className="ml-24 text-sm text-error">{formErrors.name}</div>
                    }
                    
                </div>
                <div className="flex flex-col mb-md">
                    <div className="flex items-center w-full">
                        <label className="w-24 text-right mr-2">{t('common.validateForm.email')}</label>
                        <Input 
                            
                            type="email"
                            autoComplete="email"
                            destructive={ formErrors.email ? true : false}
                            value={formState.email} 
                            onChange={(e) => handleChange('email', e.target.value)} 
                        />
                    </div>
                    {
                        formErrors.email && <div className="ml-24 text-sm text-error">{formErrors.email}</div>
                    }
                </div>
                <div className="flex flex-col mb-6">
                    <div className="flex items-center w-full">
                        <label className="w-24 text-right mr-2">{t('common.validateForm.password')}</label>
                        <Input 
                            
                            type="password" 
                            autoComplete="current-password"
                            destructive={ formErrors.password ? true : false}
                            value={formState.password} 
                            onChange={(e) => handleChange('password', e.target.value)} 
                        />
                    </div>
                    {
                        formErrors.password && <div className="ml-24 text-sm text-error">{formErrors.password}</div>
                    }
                </div>
                <div className="flex justify-end">
                    <Button 
                        type="button" 
                        variant={"secondary"}
                        className="mr-2"
                        onClick={(e) => handleReset(e)}
                    >
                        {t('common.validateForm.reset')}
                    </Button>
                    <Button 
                        type="submit" 
                        className=""
                    >
                        {t('common.validateForm.submit')}
                    </Button>
                </div>
            </form>
        </div>
    )
}

export default AccountForm