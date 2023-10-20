import { useEffect, useState } from "react"
import { useThemeContext } from '../../context/ThemeContext';
import { getRoomInfo, currentBoardState, listenForBoardState } from "../../firebase/firebase";

export default function Dado({ onRoll, user, room }) {
    const { contextTheme } = useThemeContext();

    const [question, setQuestion] = useState({});
    const [state, setState] = useState(0);
    const [category, setCategory] = useState(null);
    const [subCategory, setSubCategory] = useState(null);
    const [categories, setCategories] = useState(null);
    const [currentTurn, setCurrentTurn] = useState({});

    useEffect(() => {
        listenForBoardState(room, async (callback) => {
            if (callback) {
                const newState = await currentBoardState(room, "", true);
                setState(newState.state);

                if (newState.category) {
                    setCategory(newState.category)
                }

                if (newState.subCategory) {
                    setSubCategory(newState.subCategory)
                }
                console.log("Callback!")
            }

        })
    }, [room])

    useEffect(() => {

        const fetchData = async () => {
            try {

                const roomInfo = await getRoomInfo(room);

                if (roomInfo) {
                    setCategories(roomInfo.preferences.selectedCategories);

                    const capacity = roomInfo.playersSettings.players;
                    const startingPosition = roomInfo.playersSettings.playersIn[0].turn;

                    const positions = [];

                    for (let i = 0; i < capacity; i++) {
                        positions.push((startingPosition + i) % capacity);
                    }



                    const currentState = await currentBoardState(room, "", true);

                    if (currentState.turn) {
                        setCurrentTurn(currentState.turn);
                    } else {

                        const orderedPlayers = positions.map(pos =>
                            roomInfo.playersSettings.playersIn[pos]);

                        setCurrentTurn(orderedPlayers[0]);
                    }

                } else {
                    throw Error("No se encontro la sala!");
                }
            } catch (error) {
                console.error("Fetch data | dado");
            }
        }

        fetchData();
    }, [room])

    useEffect(() => {

        console.log("state: " + state);

        const questionArray = [category, subCategory, Math.round(Math.random() * 20)];

        setQuestion(questionArray);

    }, [category, subCategory, categories, currentTurn, state]);

    function pickCategory() {
        const categoryRandom = Math.round((categories.length - 1) * Math.random());
        const currentState = {
            state: 1,
            category:
                categories[categoryRandom],
            turn: currentTurn
        }
        currentBoardState(room, currentState);
    }

    function pickQuestion() {
        const subCategoryArray = [];

        for (const categoria in categories) {
            if (categoria === category) {
                const subCategoryObj = categories[category];
                for (const subCategory in subCategoryObj) {
                    if (subCategory) {
                        subCategoryArray.push(subCategory)
                    }
                }
            }
        }
        const subCategoryRandom = Math.round((subCategoryArray.length - 1) * Math.random());

        const currentState = {
            state: 2,
            category: category,
            subCategory: subCategoryArray[subCategoryRandom],
            turn: currentTurn
        }

        currentBoardState(room, currentState);
    }

    return (<>

        <div className={`${contextTheme} dadoContenedor`}>

            {state === 0 && currentTurn && currentTurn.uid === user.uid && user ? <>
                <button onClick={pickCategory} className={`${contextTheme} generalButtons hover`}>Seleccionar Categoría</button>
            </> : <>
                {state === 0 && currentTurn && currentTurn.uid !== user.uid && user ? <>
                    <h4>{currentTurn.username} está eligiendo la categoría</h4>
                </> : ""}
            </>}

            {state === 1 && category ? <>
                <h3>Categoria</h3>
                <h3 className="dadoRespuesta">{category}</h3>
            </> : ""}

            {state === 1 && currentTurn.uid === user.uid && user ? <>
                <button onClick={pickQuestion} className={`${contextTheme} generalButtons hover`}>Seleccionar Subcategoría</button>
            </> : <>
                {state === 1 && currentTurn.uid !== user.uid && user ? <>
                    <h4>{currentTurn.username} está eligiendo la subcategoría</h4>
                </> : ""}
            </>}

            {state === 2 && subCategory ? <>
                <h3>Categoria</h3>
                <h3 className="dadoRespuesta">{category}</h3>
                <h3>Sub Categoria</h3>
                <h3 className="dadoRespuesta">{subCategory}</h3>
                <button onClick={() => { onRoll(true) }} className={`${contextTheme} generalButtons hover`}>Ver Pregunta</button>
            </> : ""}
        </div >
    </>)
}