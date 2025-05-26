import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../Header/Header';
import styles from './PreferencesSurveyPage.module.scss';
import { useUser } from '../../hooks/useUser';
import { submitUserPreferences } from '../../store/slices/userSlice';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PreferencesSurveyPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated } = useSelector(state => state.user);
  const { updateProfile } = useUser();
  
  // Состояния для ответов на вопросы
  const [answers, setAnswers] = useState({
    experienceLevel: '',
    activities: [],
    tripDuration: '',
    comfortLevel: '',
    locations: [],
    travelCompanions: '',
    season: '',
    tripPurpose: '',
    equipmentRental: [],
    physicalActivity: ''
  });
  
  // Состояние для отслеживания текущего вопроса
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  // Проверка авторизации при загрузке компонента
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);
  
  // Если пользователь не авторизован, не рендерим основной контент
  if (!isAuthenticated) {
    return null;
  }
  
  // Массив вопросов
  const questions = [
    {
      id: 'experienceLevel',
      question: 'Какой у вас опыт походов?',
      type: 'radio',
      options: [
        { value: 'beginner', label: 'Новичок (первый раз)' },
        { value: 'camping', label: 'Был в кемпингах, но не в диких походах' },
        { value: 'occasional', label: 'Хожу в походы 1–2 раза в год' },
        { value: 'experienced', label: 'Регулярно участвую в экспедициях' }
      ]
    },
    {
      id: 'activities',
      question: 'Какие активности вам интересны?',
      type: 'checkbox',
      options: [
        { value: 'hiking', label: 'Пешие прогулки' },
        { value: 'kayaking', label: 'Сплав на байдарках/SUP' },
        { value: 'photography', label: 'Фотоохота за пейзажами' },
        { value: 'caving', label: 'Исследование пещер' },
        { value: 'yoga', label: 'Йога/медитация' }
      ]
    },
    {
      id: 'tripDuration',
      question: 'На сколько дней планируете поход?',
      type: 'radio',
      options: [
        { value: 'oneday', label: '1 день' },
        { value: 'shorttrip', label: '2–3 дня' },
        { value: 'mediumtrip', label: '4–7 дней' },
        { value: 'longtrip', label: 'Более недели' }
      ]
    },
    {
      id: 'comfortLevel',
      question: 'Какой уровень комфорта предпочитаете?',
      type: 'radio',
      options: [
        { value: 'cartent', label: 'Палатка у машины' },
        { value: 'wildcamping', label: 'Дикий кемпинг (без удобств)' },
        { value: 'glamping', label: 'Глэмпинг (удобства, электричество)' },
        { value: 'cabin', label: 'Хочу спать в хижине/избушке' }
      ]
    },
    {
      id: 'locations',
      question: 'Какие локации вас привлекают?',
      type: 'checkbox',
      options: [
        { value: 'mountains', label: 'Горы и скалы' },
        { value: 'lakes', label: 'Озёра и реки' },
        { value: 'forest', label: 'Лес и тайга' },
        { value: 'historical', label: 'Исторические места (заброшки, петроглифы)' },
        { value: 'hidden', label: 'Малоизвестные тропы' }
      ]
    },
    {
      id: 'travelCompanions',
      question: 'С кем вы путешествуете?',
      type: 'radio',
      options: [
        { value: 'friends', label: 'Один/с друзьями' },
        { value: 'children', label: 'С детьми' },
        { value: 'dog', label: 'С собакой' },
        { value: 'guide', label: 'В группе с гидом' }
      ]
    },
    {
      id: 'season',
      question: 'Какой сезон вас интересует?',
      type: 'radio',
      options: [
        { value: 'summer', label: 'Лето' },
        { value: 'autumn', label: 'Осень' },
        { value: 'winter', label: 'Зима' },
        { value: 'spring', label: 'Весна' }
      ]
    },
    {
      id: 'tripPurpose',
      question: 'Что для вас главное в походе?',
      type: 'radio',
      options: [
        { value: 'adrenaline', label: 'Адреналин и вызов' },
        { value: 'nature', label: 'Единение с природой' },
        { value: 'culture', label: 'Культурные впечатления' },
        { value: 'relaxation', label: 'Отдых для души' }
      ]
    },
    {
      id: 'equipmentRental',
      question: 'Нужна ли вам аренда снаряжения?',
      type: 'checkbox',
      options: [
        { value: 'tent', label: 'Палатка/спальник' },
        { value: 'stove', label: 'Газовая горелка' },
        { value: 'transport', label: 'Транспорт (байдарка, велосипед)' },
        { value: 'none', label: 'Не нужно' }
      ]
    },
    {
      id: 'physicalActivity',
      question: 'Как относитесь к физическим нагрузкам?',
      type: 'radio',
      options: [
        { value: 'light', label: 'Лёгкие прогулки (до 5 км/день)' },
        { value: 'moderate', label: 'Умеренные (10–15 км/день)' },
        { value: 'intense', label: 'Максимальные (20+ км/день)' },
        { value: 'transport', label: 'Только на транспорте' }
      ]
    }
  ];
  
  // Обработчик изменения ответов для радиокнопок
  const handleRadioChange = (questionId, value) => {
    setAnswers({
      ...answers,
      [questionId]: value
    });
  };
  
  // Обработчик изменения ответов для чекбоксов
  const handleCheckboxChange = (questionId, value) => {
    const currentValues = answers[questionId] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    
    setAnswers({
      ...answers,
      [questionId]: newValues
    });
  };
  
  // Обработчик для перехода к следующему вопросу
  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };
  
  // Обработчик для возврата к предыдущему вопросу
  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  // Отправка ответов на сервер
  const handleSubmit = async () => {
    console.log('Отправляем ответы:', answers);
    
    try {
      // Преобразуем ответы в массив тегов согласно требуемому формату
      const tags = [];
      
      // Добавляем тег для опыта походов
      switch(answers.experienceLevel) {
        case 'beginner': tags.push('новичок'); break;
        case 'camping': tags.push('кемпинг'); break;
        case 'occasional': tags.push('опытный'); break;
        case 'experienced': tags.push('профи'); break;
      }
      
      // Добавляем теги для активностей
      if (answers.activities.includes('hiking')) tags.push('пеший');
      if (answers.activities.includes('kayaking')) tags.push('сплав');
      if (answers.activities.includes('photography')) tags.push('фото');
      if (answers.activities.includes('caving')) tags.push('пещеры');
      if (answers.activities.includes('yoga')) tags.push('релакс');
      
      // Добавляем тег для продолжительности похода
      switch(answers.tripDuration) {
        case 'oneday': tags.push('1_день'); break;
        case 'shorttrip': tags.push('выходные'); break;
        case 'mediumtrip': tags.push('неделя'); break;
        case 'longtrip': tags.push('экспедиция'); break;
      }
      
      // Добавляем тег для уровня комфорта
      switch(answers.comfortLevel) {
        case 'cartent': tags.push('комфорт_авто'); break;
        case 'wildcamping': tags.push('дикий'); break;
        case 'glamping': tags.push('глэмпинг'); break;
        case 'cabin': tags.push('укрытие'); break;
      }
      
      // Добавляем теги для локаций
      if (answers.locations.includes('mountains')) tags.push('горы');
      if (answers.locations.includes('lakes')) tags.push('вода');
      if (answers.locations.includes('forest')) tags.push('лес');
      if (answers.locations.includes('historical')) tags.push('история');
      if (answers.locations.includes('hidden')) tags.push('секретные');
      
      // Добавляем тег для компании
      switch(answers.travelCompanions) {
        case 'friends': tags.push('взрослые'); break;
        case 'children': tags.push('дети'); break;
        case 'dog': tags.push('с_собакой'); break;
        case 'guide': tags.push('группа'); break;
      }
      
      // Добавляем тег для сезона
      switch(answers.season) {
        case 'summer': tags.push('лето'); break;
        case 'autumn': tags.push('осень'); break;
        case 'winter': tags.push('зима'); break;
        case 'spring': tags.push('весна'); break;
      }
      
      // Добавляем тег для цели похода
      switch(answers.tripPurpose) {
        case 'adrenaline': tags.push('экстрим'); break;
        case 'nature': tags.push('природа'); break;
        case 'culture': tags.push('культура'); break;
        case 'relaxation': tags.push('релакс'); break;
      }
      
      // Добавляем теги для аренды снаряжения
      if (answers.equipmentRental.includes('tent')) tags.push('аренда_снаряжение');
      if (answers.equipmentRental.includes('stove')) tags.push('аренда_кухня');
      if (answers.equipmentRental.includes('transport')) tags.push('аренда_транспорт');
      if (answers.equipmentRental.includes('none')) tags.push('без_аренды');
      
      // Добавляем тег для физической нагрузки
      switch(answers.physicalActivity) {
        case 'light': tags.push('легко'); break;
        case 'moderate': tags.push('средне'); break;
        case 'intense': tags.push('сложно'); break;
        case 'transport': tags.push('транспорт'); break;
      }
      
      console.log('Отправляем теги:', tags);
      
      // Отправляем данные через экшен Redux
      const resultAction = await dispatch(submitUserPreferences(tags));
      
      if (submitUserPreferences.fulfilled.match(resultAction)) {
        // После успешной отправки показываем сообщение
        toast.success('Ваши предпочтения сохранены! Теперь мы сможем рекомендовать вам более подходящие маршруты.', {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
        
        // Небольшая задержка перед перенаправлением на главную страницу
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(resultAction.error.message || 'Ошибка при сохранении предпочтений');
      }
    } catch (error) {
      console.error('Ошибка при отправке предпочтений:', error);
      toast.error('Произошла ошибка при сохранении предпочтений. Пожалуйста, попробуйте еще раз.', {
        position: "bottom-right",
        autoClose: 5000
      });
    }
  };
  
  // Текущий вопрос
  const currentQuestionData = questions[currentQuestion];
  
  // Проверка, можно ли перейти к следующему вопросу
  const canProceed = () => {
    const question = questions[currentQuestion];
    
    if (question.type === 'checkbox') {
      // Для чекбоксов можно двигаться дальше даже без выбора
      return true;
    } else if (question.type === 'boolean' || question.type === 'radio') {
      // Для радиокнопок и булевых значений должен быть хотя бы один выбор
      return answers[question.id] !== undefined && answers[question.id] !== '';
    }
    
    return false;
  };
  
  // Функция для отображения текущего вопроса
  const renderQuestion = () => {
    const question = questions[currentQuestion];
    
    return (
      <div className={styles.questionContainer}>
        <h2 className={styles.questionTitle}>{question.question}</h2>
        
        {question.type === 'checkbox' && (
          <div className={styles.checkboxList}>
            {question.options.map(option => (
              <label key={option.value} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={answers[question.id]?.includes(option.value) || false}
                  onChange={() => handleCheckboxChange(question.id, option.value)}
                />
                <span className={styles.checkboxText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
        
        {(question.type === 'radio' || question.type === 'boolean') && (
          <div className={styles.radioList}>
            {question.options.map(option => (
              <label key={option.value} className={styles.radioItem}>
                <input
                  type="radio"
                  name={question.id}
                  checked={answers[question.id] === option.value}
                  onChange={() => handleRadioChange(question.id, option.value)}
                />
                <span className={styles.radioText}>{option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className={styles.wrapper}>
      <Header />
      <div className={styles.container}>
        <div className={styles.surveyCard}>
          <h1 className={styles.title}>Опрос предпочтений</h1>
          <p className={styles.description}>
            Ответьте на несколько вопросов, чтобы мы могли рекомендовать вам маршруты,
            которые лучше всего соответствуют вашим интересам.
          </p>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${(currentQuestion / (questions.length - 1)) * 100}%` }}
            ></div>
          </div>
          
          <div className={styles.questionNumber}>
            Вопрос {currentQuestion + 1} из {questions.length}
          </div>
          
          {renderQuestion()}
          
          <div className={styles.buttonGroup}>
            <button 
              className={`${styles.button} ${styles.backButton}`} 
              onClick={handlePrevQuestion}
              disabled={currentQuestion === 0}
            >
              Назад
            </button>
            
            <button 
              className={`${styles.button} ${styles.nextButton}`} 
              onClick={handleNextQuestion}
              disabled={!canProceed()}
            >
              {currentQuestion === questions.length - 1 ? 'Завершить' : 'Далее'}
            </button>
          </div>
        </div>
      </div>
      <ToastContainer 
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  );
};

export default PreferencesSurveyPage; 