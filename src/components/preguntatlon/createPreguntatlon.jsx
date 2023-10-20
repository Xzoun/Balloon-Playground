import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Offcanvas from 'react-bootstrap/Offcanvas';
import Alert from 'react-bootstrap/Alert';

import { createGameRoom, upDateUser } from '../../firebase/firebase';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../../context/ThemeContext'

export default function GameSettings({ user, name, ...props }) {
    const { contextTheme } = useThemeContext();
    const navigate = useNavigate();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const [selectedPlayers, setSelectedPlayers] = useState('2');
    const [publicRoom, setPublicRoom] = useState(true);
    const [visibility, setVisibility] = useState("Publica");
    const [selectedCategoryCount, setSelectedCategoryCount] = useState(5);
    const [selectedSubCategoriesCount, setSelectedSubCategoriesCount] = useState(27);
    const [alert, setAlert] = useState(false);

    const [selectedCategories, setSelectedCategories] = useState({
        arte: { Literatura: true, Música: true, Danza: true, Teatro: true, Pintura: true },
        deportes: { Fútbol: true, eSports: true, Bascket: true, Tennis: true, Otros: true },
        hobbies: { Youtube: true, Series: true, Películas: true, Comics: true, Juegos: true },
        cultura: { Historia: true, Geografía: true, Gastronomía: true, Arquitectura: true, Tradiciones: true, Idiomas: true },
        ciencia: { Matemáticas: true, Astronomía: true, Geología: true, Química: true, Física: true, Biología: true }
    });

    /* ------------------------ Categorias */

    const handleCategoryChange = (categoryType, category) => {
        setSelectedCategories(prevSelectedCategories => {
            const updatedCategories = {
                ...prevSelectedCategories,
                [categoryType]: {
                    ...prevSelectedCategories[categoryType],
                    [category]: !prevSelectedCategories[categoryType][category]
                }
            };
       
            const newCategoriesCount = calculateSelectedCategoriesCount(updatedCategories);
            const newSubCategoriescount = calculateSelectedSubCategoriesCount(updatedCategories);
            setSelectedCategoryCount(newCategoriesCount);

            console.log(newSubCategoriescount);
            setSelectedSubCategoriesCount(newSubCategoriescount);

            return updatedCategories;
        });
    };

    const calculateSelectedCategoriesCount = (selectedCategories) => {
        let count = 0;

        for (const categoryType in selectedCategories) {
            const categorySubcategories = selectedCategories[categoryType];
            if (Object.values(categorySubcategories).some(subcategory => subcategory)) {
                count++;
            }
        }

        return count;
    };

    const calculateSelectedSubCategoriesCount = (selectedCategories) => {
        let count = 0;
        console.log(selectedCategories);
        for(const category in selectedCategories){
            const subCategoryObj = selectedCategories[category];
            for(const subCategory in subCategoryObj){
                if(subCategoryObj[subCategory]){
                    count++;
                }
            }
        }
        return count;
    }

    /* ------------------------ Capacity */

    const handlePlayerChange = (playerCount) => {
        setSelectedPlayers(playerCount);
    };

    /* ------------------------ Visibility */

    const handleVisibilityChange = (selectedVisibility) => {
        setVisibility(selectedVisibility);
        if (selectedVisibility === "Privada") {
            setPublicRoom(false);
        } else {
            setPublicRoom(true);
        }
    };

    /* ------------------------ Room */


    async function handleCreateRoom() {

        if (selectedCategoryCount < 3) {
            const delay = 2000;
            setAlert(true);

            setTimeout(() => {
                setAlert(false);
            }, delay);

            return;
        } else {
            const capacity = parseInt(selectedPlayers);

            const player = {
                uid: user.uid,
                username: user.username,
                trofies: 0,
                correct: 0,
                profilePicture: user.profilePicture,
                wrong: 0,
                active: true,
                turn: Math.floor(Math.random() * capacity)
            };

            const game = {
                game: "preguntatlon",
                publicRoom: publicRoom,
                finished: false,
                playersSettings: {
                    players: capacity,                   
                    playersIn: [player]
                },
                preferences: {
                    selectedCategories: selectedCategories,
                    categories: selectedSubCategoriesCount
                },
                messeges: [{ id: Date.now(), sender: { username: "Playground" }, message: "Recuerda ser educado!" }]
            }

            const gameUid = await createGameRoom(game);

            const tmp = { ...user };
            tmp.currentGame = gameUid;

            await upDateUser(tmp);

            navigate("/" + game.game + "/" + gameUid)
        }
    };


    return (
        <>
            <Button onClick={handleShow} className={`${contextTheme} generalButtons`}>
                {name}
            </Button>

            <Offcanvas className={`${contextTheme} offCanvas`} show={show} onHide={handleClose} {...props}>
                <Offcanvas.Header closeButton className="headerCreateGameRoom">
                    <h5 className="blockTittle">Crear Sala</h5>
                </Offcanvas.Header>
                <Offcanvas.Body className="offCanvasBody">
                    <div className="blockContainer" >
                        <p>Jugadores</p>
                        <Form className="blockBody ">
                            {['2', '3', '4'].map((category) => (
                                <div key={`jugadores-${category}`} className="mb-3">
                                    <Form.Check
                                        inline
                                        label={category}
                                        name={`jugadores`}
                                        type="radio"
                                        id={category}
                                        checked={selectedPlayers === category}
                                        onChange={() => handlePlayerChange(category)}
                                    />
                                </div>
                            ))}
                        </Form>
                    </div>
                    <div className="blockContainer">
                        <p>Visibilidad</p>
                        <Form className="blockBody">
                            {['Publica', 'Privada'].map((category) => (
                                <div key={`visibilidad-${category}`} className="mb-3">
                                    <Form.Check
                                        inline
                                        label={category}
                                        name={`visibilidad`}
                                        type="radio"
                                        id={category}
                                        checked={visibility === category}
                                        onChange={() => handleVisibilityChange(category)}
                                    />
                                </div>
                            ))}
                        </Form>
                    </div>
                    <div className="blockContainer">
                        <p>Categorias</p>
                        <div className="gameSettings">
                            <div className="blockCategories">
                                <p>Arte</p>
                                <Form className="flexCreateGame borderRight">
                                    {['Literatura', 'Música', 'Danza', 'Teatro', 'Pintura'].map((category) => (
                                        <div key={`arte-${category}`} className="mb-3">
                                            <Form.Check
                                                inline
                                                label={category}
                                                name={`arte`}
                                                type="checkbox"
                                                id={category}
                                                checked={selectedCategories.arte[category]}
                                                onChange={() => handleCategoryChange('arte', category)}
                                            />
                                        </div>
                                    ))}
                                </Form>
                            </div>
                            <div className="blockCategories">
                                <p>Deportes</p>
                                <Form className="flexCreateGame borderRight">
                                    {['Fútbol', 'eSports', 'Bascket', 'Tennis', 'Otros'].map((category) => (
                                        <div key={`deportes-${category}`} className="mb-3">
                                            <Form.Check
                                                inline
                                                label={category}
                                                name={`deportes`}
                                                type="checkbox"
                                                id={category}
                                                checked={selectedCategories.deportes[category]}
                                                onChange={() => handleCategoryChange('deportes', category)}
                                            />
                                        </div>
                                    ))}
                                </Form>
                            </div>
                            <div className="blockCategories">
                                <p>Hobbies</p>
                                <Form className="flexCreateGame borderRight">
                                    {['Youtube', 'Series', 'Películas', 'Comics', 'Juegos'].map((category) => (
                                        <div key={`hobbies-${category}`} className="mb-3">
                                            <Form.Check
                                                inline
                                                label={category}
                                                name={`hobbies`}
                                                type="checkbox"
                                                id={category}
                                                checked={selectedCategories.hobbies[category]}
                                                onChange={() => handleCategoryChange('hobbies', category)}
                                            />
                                        </div>
                                    ))}
                                </Form>
                            </div>
                            <div className="blockCategories">
                                <p>Cultura</p>
                                <Form className="flexCreateGame borderRight">
                                    {['Historia', 'Geografía', 'Arquitectura', 'Gastronomía', 'Tradiciones', 'Idiomas'].map((category) => (
                                        <div key={`cultura-${category}`} className="mb-3">
                                            <Form.Check
                                                inline
                                                label={category}
                                                name={`cultura`}
                                                type="checkbox"
                                                id={category}
                                                checked={selectedCategories.cultura[category]}
                                                onChange={() => handleCategoryChange('cultura', category)}
                                            />
                                        </div>
                                    ))}
                                </Form>
                            </div>
                            <div className="blockCategories">
                                <p>Ciencia</p>
                                <Form className="flexCreateGame">
                                    {['Matemáticas', 'Geología', 'Astronomía', 'Química', 'Física', 'Biología'].map((category) => (
                                        <div key={`ciencia-${category}`} className="mb-3">
                                            <Form.Check
                                                inline
                                                label={category}
                                                name={`ciencia`}
                                                type="checkbox"
                                                id={category}
                                                checked={selectedCategories.ciencia[category]}
                                                onChange={() => handleCategoryChange('ciencia', category)}
                                            />
                                        </div>
                                    ))}
                                </Form>
                            </div>
                        </div>
                    </div>
                    <div className="blockContainer">
                        <div className="blockBody">
                            <button className={`${contextTheme} generalButtons`} onClick={handleCreateRoom}>Confirmar</button>
                        </div>
                    </div>
                    {alert === true ? <>
                        {[
                            'danger'
                        ].map((variant) => (
                            <Alert key={variant} variant={variant} className="alert">
                                Debes seleccionar al menos tres categorías.</Alert>
                        ))}  </> : ""}
                </Offcanvas.Body>
            </Offcanvas >
        </>
    )
}