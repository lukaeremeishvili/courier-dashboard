import RegisterForm from '@/components/auth/RegisterForm';
import BackButton from '@/components/buttons/BackBtn';

const RegisterPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <BackButton />
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;
