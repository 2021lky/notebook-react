import AccountForm from "./account-form";
import { login } from "@/service/login";
import { useNavigate } from "react-router-dom";
import { useToastContext } from '@/components/base/toast';

const SignIn = () => {
    const navigate = useNavigate();
    const { notify } = useToastContext();

    const handleSubmit = (data: any) => {
        login(data).then(() => {
            // 登录成功，跳转到首页
            navigate('/');
        }).catch(err => {
            notify({ type: 'error', message: err.message });
        })
    }
    return (
        <div className="flex justify-center mt-64">
            <AccountForm onSubmit={handleSubmit} />
        </div>
    )
}

export default SignIn;