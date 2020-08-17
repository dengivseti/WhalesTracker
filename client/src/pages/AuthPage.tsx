import React, {useContext, useEffect, useState} from 'react'
import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import {makeStyles, Theme} from '@material-ui/core/styles'
import Container from '@material-ui/core/Container'
import {useHttp} from '../hooks/http.hook'
import {useMessage} from "../hooks/message.hook"
import {AuthContext} from "../context/AuthContext"



interface IFormAuth {
    username: string
    password: string
}

const useStyles = makeStyles((theme: Theme) => ({
    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    form: {
        width: '100%',
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
}))

export const AuthPage: React.FC = () => {
    const auth = useContext(AuthContext)
    const {loading, request, error, clearError} = useHttp()
    const classes = useStyles()
    const {message} = useMessage()
    const [form, setForm] = useState<IFormAuth>({
        username: '',
        password: ''
    })

    useEffect(() => {
        if (error) {
            message(error)
            clearError()
        }
    }, [error, clearError, message])

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setForm({...form, [event.target.name]: event.target.value})
    }

    const authHandler = async (event: React.MouseEvent) => {
        event.preventDefault()
        try {
            const data = await request('/api/auth/login', 'POST', {...form})
            const id = data.id
            auth.login(id)
            message('Good authentication!')
        } catch (e) {
        }
    }


    return (
        <Container component="main" maxWidth="xs">
            <div className={classes.paper}>
                <form className={classes.form} noValidate>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Usename"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={form.username}
                        onChange={changeHandler}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={form.password}
                        onChange={changeHandler}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        color="primary"
                        className={classes.submit}
                        onClick={(event) => authHandler(event)}
                        disabled={loading}
                    >
                        Sign In
                    </Button>
                </form>
            </div>
        </Container>
    )
}