import 'regenerator-runtime/runtime'
import React, { useState, useEffect } from 'react'
import { Button, Form, Input } from 'semantic-ui-react'
import { login, logout } from './utils'
import './global.css'
import getConfig from './config'
// const { networkId } = getConfig(process.env.NODE_ENV || 'development')
const { networkId } = getConfig('development')

export default function App() {
  const [account, changeAccount] = useState('')
  const [certificate, changeCertificate] = useState('')
  const [program, changeProgram] = useState('')
  const [cohort, changeCohort] = useState('')
  const [buttonDisabled, setButtonDisabled] = useState(false)
  const [showNotification, setShowNotification] = useState(false)
  const [isLoading, setLoading] = useState(false)
  const [invalidNearAcc, isInvalidNearAcc] = useState(false)

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
    setShowNotification(false)
    setButtonDisabled(true)
    setLoading(true)

    changeAccount(account.trim())
    changeCertificate(certificate.trim())
    changeProgram(program.trim())
    changeCohort(cohort.trim())

    if (
      /^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$/.test(account)
      && account.length >= 2
      && account.length <= 64
    ) {
      try {
        const total = await window.contract.nft_total_supply()
        try {
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
        } catch (error) {
          isInvalidNearAcc(true)
          console.log('Error in function window.contract.nft_mint().', error)
        }
      } catch (error) {
        console.log('Error in function window.contract.nft_total_supply().', error)
      }
    } else {
      isInvalidNearAcc(true)
    }

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
          <Form.Field
            control={Input}
            required
            label='NEAR Account'
            placeholder='my_account.near'
            onChange={(e) => {
              changeAccount(e.target.value)
              isInvalidNearAcc(false)
            }}
            value={account}
            error={invalidNearAcc ? {
              content: 'Please enter a valid NEAR account',
              pointing: 'below',
            } : false}
          />
          <Form.Field required>
            <label>Certificate URL</label>
            <Input
              type="url"
              placeholder='learnnear.club/new_certificate.pdf'
              onChange={(e) => changeCertificate(e.target.value)}
              value={certificate}
              actionPosition='left'
            >
              <Button
                content='https:// +'
                onClick={(e) => {
                  e.preventDefault()
                  !/^HTTP|HTTPS|http(s)?:\/\//.test(certificate)
                    && changeCertificate('https://' + certificate)
                }}
              />
              <input />
            </Input>
          </Form.Field>
          <Form.Field
            control={Input}
            required
            label='Program'
            placeholder='NEAR Certified Developers '
            onChange={(e) => changeProgram(e.target.value)}
            value={program}
          />
          <Form.Field
            control={Input}
            label='Cohort'
            placeholder=''
            onChange={(e) => changeCohort(e.target.value)}
            value={cohort}
          />
          <p style={{ fontSize: '.9em', fontStyle: 'italic' }}>
            <span style={{ color: '#db2828', fontWeight: 'bold' }}>*</span> – required fields
          </p>
          <Button color='green' loading={isLoading} type='submit' disabled={buttonDisabled || !valid()}>
            Create
          </Button>
        </Form>
      </main>
      {showNotification && <Notification />}
    </div>
  )
}

function Notification() {
  const urlPrefix = `https://explorer.${networkId}.near.org/accounts`
  return (
    <aside>
      <a target="_blank" rel="noreferrer" href={`${urlPrefix}/${window.accountId}`}>
        {window.accountId}
      </a>
      {' '}
      called method: 'nft_mint' in contract:
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
