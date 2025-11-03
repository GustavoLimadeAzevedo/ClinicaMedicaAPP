import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

/* ========== STACK NAVIGATOR ========== */
const Stack = createNativeStackNavigator();

/* ========== TELA DE CADASTRO ========== */
const TelaCadastro = ({ navigation }) => {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");

  const validarCPF = (cpf) => {
    return cpf.length === 11 || cpf.length === 14; 
  };

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const salvarCadastro = async () => {
    if (!nome || !cpf || !email || !usuario || !senha) {
      alert("Preencha todos os campos obrigatórios!");
      return;
    }

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    if (!validarCPF(cpf)) {
      alert("CPF inválido!");
      return;
    }

    if (!validarEmail(email)) {
      alert("E-mail inválido!");
      return;
    }

    try {
      // Verificar se usuário já existe
      const usuarioExistente = await AsyncStorage.getItem(`usuario_${usuario}`);
      if (usuarioExistente) {
        alert("Usuário já existe!");
        return;
      }

      // Salvar dados do usuário
      const usuarioData = {
        usuario,
        senha,
        nome,
        cpf,
        email,
        tipo: 'paciente' 
      };

      await AsyncStorage.setItem(`usuario_${usuario}`, JSON.stringify(usuarioData));
      
      // Salvar também no cadastro de pacientes
      const pacienteData = {
        id: Date.now().toString(),
        nome,
        cpf,
        email,
        telefone: '',
        endereco: '',
        convenio: '',
        dataNascimento: ''
      };
      
      const pacientes = JSON.parse(await AsyncStorage.getItem('pacientes') || '[]');
      pacientes.push(pacienteData);
      await AsyncStorage.setItem('pacientes', JSON.stringify(pacientes));

      alert("Cadastro realizado com sucesso!");
      navigation.navigate('Login');
    } catch (error) {
      console.log("Erro ao salvar cadastro:", error);
      alert("Erro ao realizar cadastro!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Cadastro de Paciente</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Nome completo *"
        value={nome}
        onChangeText={setNome}
      />
      
      <TextInput
        style={styles.input}
        placeholder="CPF *"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
      />
      
      <TextInput
        style={styles.input}
        placeholder="E-mail *"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Usuário *"
        value={usuario}
        onChangeText={setUsuario}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha *"
        secureTextEntry={true}
        value={senha}
        onChangeText={setSenha}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha *"
        secureTextEntry={true}
        value={confirmarSenha}
        onChangeText={setConfirmarSenha}
      />

      <Button title="Cadastrar" onPress={salvarCadastro} />
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Já tem conta? Faça login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

/* ========== TELA DE LOGIN ========== */
const TelaLogin = ({ navigation }) => {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");

  const fazerLogin = async () => {
    if (!login || !senha) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const usuarioData = await AsyncStorage.getItem(`usuario_${login}`);
      
      if (usuarioData) {
        const usuario = JSON.parse(usuarioData);
        if (senha === usuario.senha) {
          await AsyncStorage.setItem('usuarioLogado', JSON.stringify(usuario));
          alert("Login realizado com sucesso!");
          navigation.navigate('Dashboard');
        } else {
          alert("Senha incorreta!");
        }
      } else {
        alert("Usuário não encontrado!");
      }
    } catch (error) {
      console.log("Erro ao fazer login:", error);
      alert("Erro ao fazer login!");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry={true}
        value={senha}
        onChangeText={setSenha}
      />
      
      <Button title="Entrar" onPress={fazerLogin} />
      
      <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
        <Text style={styles.link}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ========== DASHBOARD PRINCIPAL ========== */
const Dashboard = ({ navigation }) => {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    carregarUsuario();
  }, []);

  const carregarUsuario = async () => {
    try {
      const usuarioData = await AsyncStorage.getItem('usuarioLogado');
      if (usuarioData) {
        setUsuario(JSON.parse(usuarioData));
      }
    } catch (error) {
      console.log("Erro ao carregar usuário:", error);
    }
  };

  const sair = async () => {
    await AsyncStorage.removeItem('usuarioLogado');
    navigation.navigate('Login');
  };

  const opcoesMenu = [
    { id: '1', titulo: 'Agendar Consulta', tela: 'Agendamento' },
    { id: '2', titulo: 'Minhas Consultas', tela: 'Consultas' },
    { id: '3', titulo: 'Prontuário Eletrônico', tela: 'Prontuario' },
    { id: '4', titulo: 'Exames', tela: 'Exames' },
    { id: '5', titulo: 'Telemedicina', tela: 'Telemedicina' },
    { id: '6', titulo: 'Triagem Online', tela: 'Triagem' },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.menuItem}
      onPress={() => navigation.navigate(item.tela)}
    >
      <Text style={styles.menuText}>{item.titulo}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sistema de Clínica Médica</Text>
      {usuario && <Text style={styles.subtitle}>Bem-vindo, {usuario.nome}!</Text>}
      
      <FlatList
        data={opcoesMenu}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        numColumns={2}
        style={styles.menuGrid}
      />
      
      <Button title="Sair" onPress={sair} color="#ff4444" />
    </View>
  );
};

/* ========== TELA DE AGENDAMENTO ========== */
const Agendamento = () => {
  const [data, setData] = useState('');
  const [hora, setHora] = useState('');
  const [medico, setMedico] = useState('');
  const [especialidade, setEspecialidade] = useState('');

  const agendarConsulta = async () => {
    if (!data || !hora || !medico) {
      alert("Preencha todos os campos!");
      return;
    }

    try {
      const consulta = {
        id: Date.now().toString(),
        data,
        hora,
        medico,
        especialidade,
        status: 'agendada'
      };

      const consultas = JSON.parse(await AsyncStorage.getItem('consultas') || '[]');
      consultas.push(consulta);
      await AsyncStorage.setItem('consultas', JSON.stringify(consultas));

      alert("Consulta agendada com sucesso!");
      setData('');
      setHora('');
      setMedico('');
      setEspecialidade('');
    } catch (error) {
      console.log("Erro ao agendar consulta:", error);
      alert("Erro ao agendar consulta!");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Agendar Consulta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Data (DD/MM/AAAA)"
        value={data}
        onChangeText={setData}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Hora (HH:MM)"
        value={hora}
        onChangeText={setHora}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Médico"
        value={medico}
        onChangeText={setMedico}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Especialidade"
        value={especialidade}
        onChangeText={setEspecialidade}
      />
      
      <Button title="Agendar Consulta" onPress={agendarConsulta} />
    </ScrollView>
  );
};

/* ========== TELA DE CONSULTAS ========== */
const Consultas = () => {
  const [consultas, setConsultas] = useState([]);

  useEffect(() => {
    carregarConsultas();
  }, []);

  const carregarConsultas = async () => {
    try {
      const consultasData = await AsyncStorage.getItem('consultas');
      if (consultasData) {
        setConsultas(JSON.parse(consultasData));
      }
    } catch (error) {
      console.log("Erro ao carregar consultas:", error);
    }
  };

  const cancelarConsulta = async (id) => {
    try {
      const novasConsultas = consultas.filter(consulta => consulta.id !== id);
      await AsyncStorage.setItem('consultas', JSON.stringify(novasConsultas));
      setConsultas(novasConsultas);
      alert("Consulta cancelada com sucesso!");
    } catch (error) {
      console.log("Erro ao cancelar consulta:", error);
      alert("Erro ao cancelar consulta!");
    }
  };

  const renderConsulta = ({ item }) => (
    <View style={styles.consultaItem}>
      <Text style={styles.consultaText}>Data: {item.data}</Text>
      <Text style={styles.consultaText}>Hora: {item.hora}</Text>
      <Text style={styles.consultaText}>Médico: {item.medico}</Text>
      <Text style={styles.consultaText}>Especialidade: {item.especialidade}</Text>
      <Text style={styles.consultaText}>Status: {item.status}</Text>
      
      <Button 
        title="Cancelar" 
        onPress={() => cancelarConsulta(item.id)} 
        color="#ff4444"
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Minhas Consultas</Text>
      
      {consultas.length === 0 ? (
        <Text style={styles.noData}>Nenhuma consulta agendada</Text>
      ) : (
        <FlatList
          data={consultas}
          renderItem={renderConsulta}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

/* ========== TELA DE PRONTUÁRIO ========== */
const Prontuario = () => {
  const [prontuarios, setProntuarios] = useState([]);
  const [observacoes, setObservacoes] = useState('');
  const [diagnostico, setDiagnostico] = useState('');
  const [prescricao, setPrescricao] = useState('');

  useEffect(() => {
    carregarProntuarios();
  }, []);

  const carregarProntuarios = async () => {
    try {
      const prontuariosData = await AsyncStorage.getItem('prontuarios');
      if (prontuariosData) {
        setProntuarios(JSON.parse(prontuariosData));
      }
    } catch (error) {
      console.log("Erro ao carregar prontuários:", error);
    }
  };

  const adicionarProntuario = async () => {
    if (!observacoes || !diagnostico) {
      alert("Preencha observações e diagnóstico!");
      return;
    }

    try {
      const prontuario = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString(),
        observacoes,
        diagnostico,
        prescricao
      };

      const novosProntuarios = [...prontuarios, prontuario];
      await AsyncStorage.setItem('prontuarios', JSON.stringify(novosProntuarios));
      setProntuarios(novosProntuarios);
      
      setObservacoes('');
      setDiagnostico('');
      setPrescricao('');
      
      alert("Prontuário adicionado com sucesso!");
    } catch (error) {
      console.log("Erro ao adicionar prontuário:", error);
      alert("Erro ao adicionar prontuário!");
    }
  };

  const renderProntuario = ({ item }) => (
    <View style={styles.prontuarioItem}>
      <Text style={styles.prontuarioData}>{item.data}</Text>
      <Text style={styles.prontuarioText}>Observações: {item.observacoes}</Text>
      <Text style={styles.prontuarioText}>Diagnóstico: {item.diagnostico}</Text>
      <Text style={styles.prontuarioText}>Prescrição: {item.prescricao}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Prontuário Eletrônico</Text>
      
      <ScrollView style={styles.formContainer}>
        <TextInput
          style={styles.textArea}
          placeholder="Observações médicas"
          value={observacoes}
          onChangeText={setObservacoes}
          multiline
        />
        
        <TextInput
          style={styles.textArea}
          placeholder="Diagnóstico"
          value={diagnostico}
          onChangeText={setDiagnostico}
          multiline
        />
        
        <TextInput
          style={styles.textArea}
          placeholder="Prescrição médica"
          value={prescricao}
          onChangeText={setPrescricao}
          multiline
        />
        
        <Button title="Adicionar ao Prontuário" onPress={adicionarProntuario} />
      </ScrollView>

      <Text style={styles.subtitle}>Histórico</Text>
      {prontuarios.length === 0 ? (
        <Text style={styles.noData}>Nenhum registro no prontuário</Text>
      ) : (
        <FlatList
          data={prontuarios}
          renderItem={renderProntuario}
          keyExtractor={item => item.id}
          style={styles.historyList}
        />
      )}
    </View>
  );
};

/* ========== TELA DE EXAMES ========== */
const Exames = () => {
  const [exames, setExames] = useState([]);
  const [tipoExame, setTipoExame] = useState('');
  const [resultado, setResultado] = useState('');

  const adicionarExame = async () => {
    if (!tipoExame) {
      alert("Informe o tipo de exame!");
      return;
    }

    try {
      const exame = {
        id: Date.now().toString(),
        data: new Date().toLocaleDateString(),
        tipo: tipoExame,
        resultado: resultado || 'Pendente'
      };

      const novosExames = [...exames, exame];
      await AsyncStorage.setItem('exames', JSON.stringify(novosExames));
      setExames(novosExames);
      
      setTipoExame('');
      setResultado('');
      
      alert("Exame registrado com sucesso!");
    } catch (error) {
      console.log("Erro ao registrar exame:", error);
      alert("Erro ao registrar exame!");
    }
  };

  const renderExame = ({ item }) => (
    <View style={styles.exameItem}>
      <Text style={styles.exameData}>{item.data}</Text>
      <Text style={styles.exameText}>Tipo: {item.tipo}</Text>
      <Text style={styles.exameText}>Resultado: {item.resultado}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gerenciamento de Exames</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Tipo de exame"
        value={tipoExame}
        onChangeText={setTipoExame}
      />
      
      <TextInput
        style={styles.textArea}
        placeholder="Resultado (opcional)"
        value={resultado}
        onChangeText={setResultado}
        multiline
      />
      
      <Button title="Registrar Exame" onPress={adicionarExame} />

      <Text style={styles.subtitle}>Histórico de Exames</Text>
      {exames.length === 0 ? (
        <Text style={styles.noData}>Nenhum exame registrado</Text>
      ) : (
        <FlatList
          data={exames}
          renderItem={renderExame}
          keyExtractor={item => item.id}
        />
      )}
    </View>
  );
};

/* ========== TELA DE TELEMEDICINA ========== */
const Telemedicina = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Atendimento por Telemedicina</Text>
      <Text style={styles.infoText}>
        Funcionalidade de telemedicina integrada com vídeo chamada.
      </Text>
      <Text style={styles.infoText}>
        Consultas online com registro automático no prontuário.
      </Text>
      <Button title="Iniciar Videochamada" onPress={() => alert("Videochamada iniciada!")} />
    </View>
  );
};

/* ========== TELA DE TRIAGEM COM IA ========== */
const Triagem = () => {
  const [sintomas, setSintomas] = useState('');
  const [intensidade, setIntensidade] = useState('');
  const [duracao, setDuracao] = useState('');
  const [resultadoTriagem, setResultadoTriagem] = useState(null);

  const realizarTriagem = () => {
    if (!sintomas) {
      alert("Descreva seus sintomas!");
      return;
    }

    // Simulação de IA para diagnóstico preliminar
    const sintomasLower = sintomas.toLowerCase();
    let especialidade = 'Clínico Geral';
    let urgencia = 'Rotina';
    
    if (sintomasLower.includes('dor no peito') || sintomasLower.includes('falta de ar')) {
      especialidade = 'Cardiologia';
      urgencia = 'Atendimento Imediato';
    } else if (sintomasLower.includes('febre') && sintomasLower.includes('tosse')) {
      especialidade = 'Pneumologia';
      urgencia = 'Consulta em até 24h';
    } else if (sintomasLower.includes('dor abdominal')) {
      especialidade = 'Gastroenterologia';
      urgencia = 'Consulta em até 24h';
    }

    setResultadoTriagem({
      especialidade,
      urgencia,
      sintomasAnalisados: sintomas
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Triagem Online com IA</Text>
      
      <TextInput
        style={styles.textArea}
        placeholder="Descreva seus sintomas..."
        value={sintomas}
        onChangeText={setSintomas}
        multiline
      />
      
      <TextInput
        style={styles.input}
        placeholder="Intensidade (leve, moderada, forte)"
        value={intensidade}
        onChangeText={setIntensidade}
      />
      
      <TextInput
        style={styles.input}
        placeholder="Duração dos sintomas"
        value={duracao}
        onChangeText={setDuracao}
      />
      
      <Button title="Realizar Triagem" onPress={realizarTriagem} />

      {resultadoTriagem && (
        <View style={styles.resultadoTriagem}>
          <Text style={styles.resultadoTitle}>Resultado da Triagem</Text>
          <Text style={styles.resultadoText}>
            Especialidade Recomendada: {resultadoTriagem.especialidade}
          </Text>
          <Text style={styles.resultadoText}>
            Nível de Urgência: {resultadoTriagem.urgencia}
          </Text>
          <Text style={styles.resultadoText}>
            Sintomas Analisados: {resultadoTriagem.sintomasAnalisados}
          </Text>
          
          <Button 
            title="Agendar Consulta com Especialista" 
            onPress={() => alert(`Agendando com ${resultadoTriagem.especialidade}`)} 
          />
        </View>
      )}
    </ScrollView>
  );
};

/* ========== ESTILOS ========== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#555',
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
  },
  textArea: {
    height: 100,
    borderColor: '#ddd',
    borderWidth: 1,
    marginBottom: 15,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    textAlignVertical: 'top',
  },
  link: {
    color: '#007AFF',
    textAlign: 'center',
    marginTop: 15,
  },
  menuGrid: {
    marginVertical: 20,
  },
  menuItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    margin: 5,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuText: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  consultaItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  consultaText: {
    fontSize: 14,
    marginBottom: 5,
  },
  prontuarioItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  prontuarioData: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  prontuarioText: {
    fontSize: 14,
    marginBottom: 3,
  },
  exameItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exameData: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  exameText: {
    fontSize: 14,
    marginBottom: 3,
  },
  noData: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
    color: '#555',
  },
  resultadoTriagem: {
    backgroundColor: 'white',
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultadoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultadoText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  formContainer: {
    marginBottom: 20,
  },
  historyList: {
    maxHeight: 300,
  },
});

/* ========== APP PRINCIPAL ========== */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={TelaLogin} />
        <Stack.Screen name="Cadastro" component={TelaCadastro} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Agendamento" component={Agendamento} />
        <Stack.Screen name="Consultas" component={Consultas} />
        <Stack.Screen name="Prontuario" component={Prontuario} />
        <Stack.Screen name="Exames" component={Exames} />
        <Stack.Screen name="Telemedicina" component={Telemedicina} />
        <Stack.Screen name="Triagem" component={Triagem} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}