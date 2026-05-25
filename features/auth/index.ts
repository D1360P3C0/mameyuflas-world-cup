/**
 * Barrel export del feature de autenticación.
 * Solo exporta lo que otros features/páginas pueden usar.
 */

// Acciones
export { loginAction, registerAction, logoutAction, forgotPasswordAction, signInWithGoogleAction, updateProfileAction } from './actions/auth.actions'

// Componentes
export { LoginForm }         from './components/LoginForm'
export { RegisterForm }      from './components/RegisterForm'
export { ForgotPasswordForm } from './components/ForgotPasswordForm'
export { GoogleAuthButton }  from './components/GoogleAuthButton'
export { EditProfileForm }   from './components/EditProfileForm'

// Hooks
export { useCurrentUser } from './hooks/useCurrentUser'
