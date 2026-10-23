import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { AnimatedDialog } from '../AnimatedDialog'
import { useReducedMotion } from '../../hooks/useReducedMotion'

export function RoomSettings({ game, feedback, connected, onSave, onClose }) {
  const [publicRoom, setPublicRoom] = useState(!game.private)
  const [passwordEnabled, setPasswordEnabled] = useState(Boolean(game.passwordProtected))
  const [password, setPassword] = useState('')
  const reduce = useReducedMotion()
  const busy = feedback?.pending
  return <AnimatedDialog title="Room settings" onClose={onClose}>
    <form onSubmit={event => {
      event.preventDefault()
      const settings = { private: !publicRoom }
      if (!passwordEnabled) settings.password = ''
      else if (password) settings.password = password
      onSave(settings)
    }}>
      <fieldset disabled={busy || !connected} className="flex min-w-0 flex-col gap-4">
        <label className="room-option">
          <input type="checkbox" checked={publicRoom} onChange={event => setPublicRoom(event.target.checked)} />
          <span><span className="block font-medium">Public table</span><span className="room-help">Show this table in the lobby when a seat is available.</span></span>
        </label>
        <label className="room-option">
          <input type="checkbox" checked={passwordEnabled} onChange={event => setPasswordEnabled(event.target.checked)} />
          <span><span className="block font-medium">Require a password</span><span className="room-help">Applies to new players. People already seated stay connected.</span></span>
        </label>
        <AnimatePresence initial={false}>
          {passwordEnabled && <motion.div key="password" initial={{ opacity: 0, y: reduce ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.14 }}>
            <label htmlFor="room-password" className="mb-2 block text-sm">{game.passwordProtected ? 'New password' : 'Room password'}</label>
            <input id="room-password" type="password" autoComplete="new-password" maxLength={64}
              required={passwordEnabled && !game.passwordProtected} disabled={!passwordEnabled} value={password} onChange={event => setPassword(event.target.value)} className="room-input"
              placeholder={game.passwordProtected ? 'Leave blank to keep current password' : 'Choose a password'} />
            <p className="room-help">Up to 64 characters. Share it with the people you want to invite.</p>
          </motion.div>}
        </AnimatePresence>
        {feedback?.error && <p role="alert" className="text-sm text-suit-red">{feedback.error}</p>}
        {!connected && <p role="alert" className="text-sm text-suit-red">Reconnect before changing settings.</p>}
        <button type="submit" className="action-button room-save">{busy ? 'Saving…' : 'Save settings'}</button>
      </fieldset>
    </form>
  </AnimatedDialog>
}
