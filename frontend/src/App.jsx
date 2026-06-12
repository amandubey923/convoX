import './App.css';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';


function App() {
  return (
    <div>
      <h1>Convo X</h1>
       <header>
        <Show when="signed-out">
          <SignInButton mode="modal" />
          <SignUpButton mode="modal" />
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </header>

    </div>
  )
}

export default App
