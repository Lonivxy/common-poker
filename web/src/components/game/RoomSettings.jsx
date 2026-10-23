import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AnimatedDialog } from '../AnimatedDialog'
import { setReducedMotion, useReducedMotion } from '../../hooks/useReducedMotion'

export function RoomSettings({ game, feedback, connected, isHost, onSave, onClose }) {
  const [publicRoom, setPublicRoom] = useState(!game.private)
  const [passwordEnabled, setPasswordEnabled] = useState(Boolean(game.passwordProtected))
  const [password, setPassword] = useState('')
  const reduce = useReducedMotion()
  const busy = feedback?.pending

  return <AnimatedDialog title="Settings" onClose={onClose}>
    {isHost && <form onSubmit={event => {
      event.preventDefault()
      const settings = { private: !publicRoom }
      if (!passwordEnabled) settings.password = ''
      else if (password) settings.password = password
      onSave(settings)
    }}>
      <fieldset disabled={busy || !connected} className="flex min-w-0 flex-col gap-4">
        <label className="room-option">
          <input type="checkbox" checked={publicRoom} onChange={event => setPublicRoom(event.target.checked)} />
          <span>Public table</span>
        </label>
        <label className="room-option">
          <input type="checkbox" checked={passwordEnabled} onChange={event => setPasswordEnabled(event.target.checked)} />
          <span>Require a password</span>
        </label>
        <AnimatePresence initial={false}>
          {passwordEnabled && <motion.div key="password" initial={reduce ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: reduce ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.14 }}>
            <label htmlFor="room-password" className="mb-2 block text-sm">{game.passwordProtected ? 'New password' : 'Room password'}</label>
            <input id="room-password" type="password" autoComplete="new-password" maxLength={64}
              required={!game.passwordProtected} value={password} onChange={event => setPassword(event.target.value)} className="room-input"
              placeholder={game.passwordProtected ? 'Leave blank to keep' : 'Set password'} />
          </motion.div>}
        </AnimatePresence>
        {feedback?.error && <p role="alert" className="text-sm text-suit-red">{feedback.error}</p>}
        {!connected && <p role="alert" className="text-sm text-suit-red">Reconnect before saving.</p>}
        <button type="submit" className="action-button room-save">{busy ? 'Saving…' : 'Save'}</button>
      </fieldset>
    </form>}

    <label className={`room-option ${isHost ? 'mt-5 border-t border-suit-dark/20 pt-4' : ''}`}>
      <input type="checkbox" checked={reduce} onChange={event => setReducedMotion(event.target.checked)} />
      <span>Reduce Motion</span>
    </label>
  </AnimatedDialog>
}
