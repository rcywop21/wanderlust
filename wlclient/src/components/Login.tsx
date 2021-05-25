import React from 'react';
import { GlobalState, PlayerState } from 'wlcommon';
import { SocketContext } from '../socket/socket';
import './Login.css';

export interface NormalLoginProps {
    updateLoggedIn: (x: boolean) => void;
    updatePlayerState: (state: PlayerState) => void;
    updateGlobalState: (state: GlobalState) => void;
    updateTeamId: (x: number) => void;
    mode: 'player' | 'mentor';
}

export interface AdminLoginProps {
    updateLoggedIn: (x: boolean) => void;
    mode: 'admin';
}

export type LoginProps = NormalLoginProps | AdminLoginProps;

interface AuthOkReplyPayload {
    socketId: string;
    globalState: GlobalState;
    playerState: PlayerState;
}

const Login = (props: LoginProps): React.ReactElement => {
    const { updateLoggedIn, mode } = props;
    const [groupName, setGroupName] = React.useState<number | undefined>(
        undefined
    );
    const [password, setPassword] = React.useState('');
    const [hasErrorMessage, setHasErrorMessage] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState('');

    const socket = React.useContext(SocketContext);

    React.useEffect(() => {
        if (socket && !socket.connected) {
            socket.connect();
        }
    }, [socket]);

    function authenticateReply(eventType: 'error', payload: string): void;
    function authenticateReply(
        eventType: 'auth_ok',
        payload: AuthOkReplyPayload
    ): void;
    function authenticateReply(
        eventType: 'error' | 'auth_ok',
        payload: string | AuthOkReplyPayload
    ): void {
        if (eventType === 'error') {
            setHasErrorMessage(true);
            setErrorMessage(payload as string);
        } else {
            updateLoggedIn(true);
            console.log(mode);
            if (mode !== 'admin') {
                const {
                    updatePlayerState,
                    updateGlobalState,
                    updateTeamId
                } = props as NormalLoginProps;
                const {
                    playerState,
                    globalState,
                } = payload as AuthOkReplyPayload;
                updatePlayerState(playerState);
                updateGlobalState(globalState);
                if (groupName) {
                    updateTeamId(groupName);
                }
            }
        }
    }

    const handleLogin = () => {
        if (groupName === undefined && password === '') {
            setHasErrorMessage(true);
            setErrorMessage('Group Name and Password cannot be empty');
            return;
        } else if (groupName === undefined) {
            setHasErrorMessage(true);
            setErrorMessage('Group Name cannot be empty');
            return;
        } else if (password == '') {
            setHasErrorMessage(true);
            setErrorMessage('Password cannot be empty');
            return;
        }

        if (socket !== null) {
            socket.emit(
                'authenticate',
                { id: groupName, mode: mode, pass: password },
                authenticateReply
            );
        }
    };

    const onGroupNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.value === '') {
            setGroupName(undefined);
            return;
        }
        const groupId = parseInt(event.target.value);
        if (Number.isNaN(groupId) || groupId < 0) return;
        setGroupName(groupId);
    };

    return (
        <div className="login">
            <div className="title">Group Name</div>
            <input
                value={groupName === undefined ? '' : groupName.toString()}
                onChange={onGroupNameChange}
            ></input>
            <div className="title">Passcode</div>
            <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            ></input>
            <div>
                <button className="loginButton" onClick={handleLogin}>Login</button>
            </div>
            <div>
                {hasErrorMessage && (
                    <div className="errorMessage">{errorMessage}</div>
                )}
                {!hasErrorMessage && (
                    <div>
                        <br></br>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;
