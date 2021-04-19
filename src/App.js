import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'
import { Button, Form } from 'semantic-ui-react'
import { login, logout } from './utils'
import './global.css'

import getConfig from './config'
const { networkId } = getConfig(process.env.NODE_ENV || 'development')

export default function App() {
  const [account, changeAccount] = useState('')
  const [certificate, changeCertificate] = useState('')
  const [program, changeProgram] = useState('')
  const [cohort, changeCohort] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isLoading, setLoading] = useState(false)

  if (!window.walletConnection.isSignedIn()) {
    return (
      <main>
        <h1 style={{ marginTop: '2.5em' }}>Create NFT for NCD Certificate</h1>
        <p style={{ textAlign: 'center', marginTop: '2.5em' }}>
          <button onClick={login}>Sign in</button>
        </p>
      </main>
    )
  }

  const valid = () => account !== '' && certificate !== '' && program !== ''

  const handleSubmit = async (event) => {
    event.preventDefault()
    setButtonDisabled(true)
    setLoading(true)
          
    const total = await window.contract.nft_total_supply()

    await window.contract.nft_mint({
      "token_id": total.toString(),
      "metadata":{
        "title": "Certificate of Completion",
        "description": `${account} has successfully completed the requirements of ${program}`,
        "media": certificate,
        "copies": "1",
        "issued_at": (new Date()).toISOString(),
        "extra": JSON.stringify({
          "program": program,
          "cohort": cohort,
          "owner": account
        })
      },
      "owner_id": account
    })

    setShowNotification(true)
    setLoading(false)
    setButtonDisabled(false)
  }

  return (
    <div style={{ padding: '1em' }}>
      <div style={{ height: '4em' }}>
        <button className="link" style={{ float: 'right' }} onClick={logout}>
          Sign out
        </button>
        <div style={{ display: 'inline', float: 'right', padding: '0.3em 0.75em', fontWeight: 'bold' }}>
          <p>{window.accountId}</p>
        </div>
      </div>
      <main>
        <h1>
          Create NFT for NCD Certificate
        </h1>
        <Form onSubmit={handleSubmit}>
          <Form.Field required>
            <label>NEAR Account</label>
            <input placeholder='NEAR Account' onChange={(e) => changeAccount(e.target.value)} value={account} />
          </Form.Field>
          <Form.Field required>
            <label>Certificate URL</label>
            <input placeholder='Certificate URL' onChange={(e) => changeCertificate(e.target.value)} value={certificate} />
          </Form.Field>
          <Form.Field required>
            <label>Program</label>
            <input placeholder='Program' onChange={(e) => changeProgram(e.target.value)} value={program} />
          </Form.Field>
          <Form.Field>
            <label>Cohort</label>
            <input placeholder='Cohort' onChange={(e) => changeCohort(e.target.value)} value={cohort} />
          </Form.Field>
          <p style={{ fontSize: '.9em', fontStyle: 'italic' }}><span style={{ color: '#db2828', fontWeight: 'bold' }}>*</span> – required fields</p>
          <Button loading={isLoading} type='submit' disabled={buttonDisabled || !valid()}>Create</Button>
        </Form>
      </main>
      {showNotification && <Notification />}
    </div>
  )
}

// this component gets rendered by App after the form is submitted
function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '/* React trims whitespace around tags; insert literal space character when needed */}
      called method: 'setGreeting' in contract:
      {' '}
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.contract.contractId}`}>
        {window.contract.contractId}
      </a>
      <footer>
        <div>✔ Succeeded</div>
        <div>Just now</div>
      </footer>
    </aside>
  )
}
